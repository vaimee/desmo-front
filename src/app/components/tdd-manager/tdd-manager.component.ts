import { ITransactionSent } from './../../services/desmo-hub/desmo-hub.types';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { DesmoHubService } from 'src/app/services/desmo-hub/desmo-hub.service';

interface TDD {
  address: string;
  url: string;
  state: boolean;
}

@Component({
  selector: 'app-tdd-manager',
  templateUrl: './tdd-manager.component.html',
  styleUrls: ['./tdd-manager.component.css'],
})
export class TddManagerComponent implements OnInit, OnDestroy {
  private readonly CACHE_KEY: string = 'tddList';
  tddUrl = '';
  displayedColumns: string[] = ['address', 'url', 'state'];
  tableData: TDD[];
  dataSource: MatTableDataSource<TDD>;

  tddRetrieved: boolean = false;
  tddEnabled: boolean = true;
  loading: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(public dialog: MatDialog, private desmoHub: DesmoHubService) {
    // Check the cache for pre-existing data or initialise with an empty list:
    const tddList: string = localStorage.getItem(this.CACHE_KEY) ?? '[]';
    this.tableData = JSON.parse(tddList) as TDD[];
    this.dataSource = new MatTableDataSource<TDD>(this.tableData);

    if (this.tableData.length > 0) {
      this.tddRetrieved = true;
      this.tddEnabled = this.tableData[0].state;
    }
  }

  ngOnInit(): void {
    // tddCreated subscription
    this.subscriptions.add(
      this.desmoHub.tddCreated$.subscribe((event) => {
        const rowIndex: number = this.tableData.findIndex(
          (tdd: TDD) => tdd.address === event.key
        );
        if (rowIndex >= 0) {
          this.tableData[rowIndex].url = event.url;
          this.tableData[rowIndex].state = !event.disabled;
        } else {
          this.tableData.push({
            address: event.key,
            url: event.url,
            state: !event.disabled,
          });
        }

        // Save new data inside the cache:
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));

        this.dataSource = new MatTableDataSource<TDD>(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = !event.disabled;
        this.loading = false;
      })
    );

    // tddDisabled subscription
    this.subscriptions.add(
      this.desmoHub.tddDisabled$.subscribe((event) => {
        const rowIndex: number = this.tableData.findIndex(
          (tdd: TDD) => tdd.address === event.key
        );
        if (rowIndex >= 0) {
          this.tableData[rowIndex].state = false;
        } else {
          this.tableData.push({
            address: event.key,
            url: event.url,
            state: false,
          });
        }

        // Save new data inside the cache:
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));

        this.dataSource = new MatTableDataSource<TDD>(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = false;
        this.loading = false;
      })
    );

    // tddEnabled subscription
    this.subscriptions.add(
      this.desmoHub.tddEnabled$.subscribe((event) => {
        const rowIndex: number = this.tableData.findIndex(
          (tdd: TDD) => tdd.address === event.key
        );
        if (rowIndex >= 0) {
          this.tableData[rowIndex].state = true;
        } else {
          this.tableData.push({
            address: event.key,
            url: event.url,
            state: true,
          });
        }

        // Save new data inside the cache:
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));

        this.dataSource = new MatTableDataSource<TDD>(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = true;
        this.loading = false;
      })
    );

    // tddRetrieval subscription
    this.subscriptions.add(
      this.desmoHub.tddRetrieval$.subscribe((event) => {
        const rowIndex: number = this.tableData.findIndex(
          (tdd: TDD) => tdd.address === event.key
        );
        if (rowIndex >= 0) {
          this.tableData[rowIndex].url = event.url;
          this.tableData[rowIndex].state = !event.disabled;
        } else {
          this.tableData.push({
            address: event.key,
            url: event.url,
            state: !event.disabled,
          });
        }

        // Save new data inside the cache:
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));

        this.dataSource = new MatTableDataSource<TDD>(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = !event.disabled;
        this.loading = false;
      })
    );

    // This must be done at the end:
    this.desmoHub.connect();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  registerTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmoHub.registerTDD(this.tddUrl);
        this.loading = true;
      }
    });
  }

  disableTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmoHub.disableTDD();
        this.loading = true;
      }
    });
  }

  enableTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmoHub.enableTDD();
        this.loading = true;
      }
    });
  }

  getTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmoHub.getTDD();
        this.loading = true;
      }
    });
  }
}
