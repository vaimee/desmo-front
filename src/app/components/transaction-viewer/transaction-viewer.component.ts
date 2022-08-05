import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { MatPaginator } from '@angular/material/paginator';
import { ISentTransaction, OperationType } from '@vaimee/desmold-sdk';

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
  tableData: ITransaction[];
  dataSource: MatTableDataSource<ITransaction>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private subscriptions: Subscription = new Subscription();

  constructor(private desmold: DesmoldSDKService) {
    // Check the cache for pre-existing data or initialise with an empty list:
    const txList: string = sessionStorage.getItem(this.CACHE_KEY) ?? '[]';
    this.tableData = JSON.parse(txList) as ITransaction[];
    this.dataSource = new MatTableDataSource<ITransaction>(this.tableData);
  }

  async ngOnInit(): Promise<void> {
    await this.desmold.connect();

    this.subscriptions.add(
      this.desmold.desmoHub.transactionSent$.subscribe((tx) => {
        this.tableData.unshift({
          invokedOperation: this._fromOperationTypeToString(tx.invokedOperation),
          hash: tx.hash,
          sent: tx.sent,
        } as ITransaction);
        this.dataSource = new MatTableDataSource<ITransaction>(
          this.tableData
        );

        // Save new data inside the cache:
        sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));
      })
    );
  }

  private _fromOperationTypeToString(opType: OperationType): string {
    switch(opType) {
      case OperationType.registerTDD: return 'Register TDD';
      case OperationType.disableTDD: return 'Disable TDD';
      case OperationType.enableTDD: return 'Enable TDD';
      case OperationType.getNewRequestID: return 'Request ID';
      default: return 'unknown';
    }
  }

  clearCache(): void {
    this.tableData = [];
    this.dataSource = new MatTableDataSource<ITransaction>(this.tableData);
    // Save new data inside the cache:
    sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
