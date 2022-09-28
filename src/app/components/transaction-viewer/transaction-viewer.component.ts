import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, tap } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { MatPaginator } from '@angular/material/paginator';
import { OperationType } from '@vaimee/desmold-sdk';

interface ITransaction {
  invokedOperation: string;
  hash: string;
  sent: Date;
}

@Component({
  selector: 'app-transaction-viewer',
  templateUrl: './transaction-viewer.component.html',
  styleUrls: ['./transaction-viewer.component.css'],
})
export class TransactionViewerComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private readonly CACHE_KEY: string = 'transactionList';
  displayedColumns: string[] = ['operation', 'hash', 'sent'];
  txDict: Record<string, ITransaction[]>;
  dataSource: MatTableDataSource<ITransaction>;
  private subscriptions: Subscription;
  private currentUserAddress = '';
  public txListSize = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private desmold: DesmoldSDKService) {
    // Check the cache for pre-existing data or initialise with an empty object:
    const txDictStr: string = localStorage.getItem(this.CACHE_KEY) ?? '{}';
    this.txDict = JSON.parse(txDictStr) as Record<string, ITransaction[]>;

    this.dataSource = new MatTableDataSource<ITransaction>([]);
    this.subscriptions = new Subscription();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.subscriptions.add(
      this.paginator.page.pipe(tap(() => this.showDataPage())).subscribe()
    );
  }

  async ngOnInit(): Promise<void> {
    await this.desmold.isReady;

    if (!this.desmold.desmoHub.isListening) {
      await this.desmold.desmoHub.startListeners();
    }

    this.currentUserAddress = this.desmold.userAddress;
    this.updateTxList();

    // Update the table when the selected account changes:
    this.subscriptions.add(
      this.desmold.accountsChanged.subscribe(({ newValue }) => {
        this.currentUserAddress = newValue;
        this.updateTxList();
      })
    );

    // Transactions subscription:
    this.subscriptions.add(
      this.desmold.desmoHub.transactionSent$.subscribe((tx) => {
        this.txDict[this.currentUserAddress].unshift({
          invokedOperation: this.fromOperationTypeToString(tx.invokedOperation),
          hash: tx.hash,
          sent: tx.sent,
        } as ITransaction);

        this.updateTxList();
      })
    );
  }

  public clearCache(): void {
    if (this.txDict[this.currentUserAddress] !== undefined) {
      this.txDict[this.currentUserAddress] = [];
    }
    this.updateTxList();
  }

  private fromOperationTypeToString(opType: OperationType): string {
    switch (opType) {
      case OperationType.registerTDD:
        return 'Register TDD';
      case OperationType.disableTDD:
        return 'Disable TDD';
      case OperationType.enableTDD:
        return 'Enable TDD';
      case OperationType.getNewRequestID:
        return 'Request ID';
      default:
        return 'unknown';
    }
  }

  private updateTxList(): void {
    // We must be sure that txDict contains an entry for
    // the newly selected user address:
    if (this.txDict[this.currentUserAddress] === undefined) {
      this.txDict[this.currentUserAddress] = [];
    }
    this.txListSize = this.txDict[this.currentUserAddress].length;

    this.showDataPage();

    // Update the cache:
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.txDict));
  }

  private showDataPage() {
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end = start + this.paginator.pageSize;
    const data = this.txDict[this.currentUserAddress].slice(start, end);
    this.dataSource = new MatTableDataSource<ITransaction>(data);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
