import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { MatPaginator } from '@angular/material/paginator';
import { ISentTransaction } from '@vaimee/desmold-sdk';
@Component({
  selector: 'app-transaction-viewer',
  templateUrl: './transaction-viewer.component.html',
  styleUrls: ['./transaction-viewer.component.css'],
})
export class TransactionViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly CACHE_KEY: string = 'transactionList';
  displayedColumns: string[] = ['operation', 'hash', 'sent', 'confirmed'];
  tableData: ISentTransaction[];
  dataSource: MatTableDataSource<ISentTransaction>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private subscriptions: Subscription = new Subscription();

  constructor(private desmold: DesmoldSDKService) {
    // Check the cache for pre-existing data or initialise with an empty list:
    const txList: string = localStorage.getItem(this.CACHE_KEY) ?? '[]';
    this.tableData = JSON.parse(txList) as ISentTransaction[];
    this.dataSource = new MatTableDataSource<ISentTransaction>(this.tableData);
  }

  async ngOnInit(): Promise<void> {
    await this.desmold.connect();

    this.subscriptions.add(
      this.desmold.desmoHub.transactionSent$.subscribe((tx) => {
        this.tableData.unshift(tx);
        this.dataSource = new MatTableDataSource<ISentTransaction>(
          this.tableData
        );

        // Save new data inside the cache:
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));
      })
    );
  }

  clearCache() {
    this.tableData = [];
    this.dataSource = new MatTableDataSource<ISentTransaction>(
      this.tableData
    );
    // Save new data inside the cache:
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
