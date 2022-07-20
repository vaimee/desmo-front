import { ITransactionSent } from './../../services/desmo-hub/desmo-hub.types';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { DesmoHubService } from 'src/app/services/desmo-hub/desmo-hub.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-transaction-viewer',
  templateUrl: './transaction-viewer.component.html',
  styleUrls: ['./transaction-viewer.component.css'],
})
export class TransactionViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly CACHE_KEY: string = 'transactionList';
  displayedColumns: string[] = ['operation', 'hash', 'sent', 'confirmed'];
  tableData: ITransactionSent[];
  dataSource: MatTableDataSource<ITransactionSent>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private subscriptions: Subscription = new Subscription();

  constructor(private desmoHub: DesmoHubService) {
    // Check the cache for pre-existing data or initialise with an empty list:
    const txList: string = localStorage.getItem(this.CACHE_KEY) ?? '[]';
    this.tableData = JSON.parse(txList) as ITransactionSent[];
    this.dataSource = new MatTableDataSource<ITransactionSent>(this.tableData);
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.desmoHub.transactionSent$.subscribe((tx) => {
        this.tableData.unshift(tx);
        this.dataSource = new MatTableDataSource<ITransactionSent>(
          this.tableData
        );

        // Save new data inside the cache:
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
