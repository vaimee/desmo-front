import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ITDD } from '@vaimee/desmold-sdk';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';

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

  tddRetrieved = false;
  tddEnabled = false;
  loading = false;
  private subscriptions: Subscription = new Subscription();

  constructor(public dialog: MatDialog, private desmold: DesmoldSDKService) {
    // Check the cache for pre-existing data or initialise with an empty list:
    const tddList: string = localStorage.getItem(this.CACHE_KEY) ?? '[]';
    this.tableData = JSON.parse(tddList) as TDD[];
    this.dataSource = new MatTableDataSource<TDD>(this.tableData);

    if (this.tableData.length > 0) {
      this.tddRetrieved = true;
      this.tddEnabled = this.tableData[0].state;
    }
  }

  async ngOnInit(): Promise<void> {
    await this.desmold.connect();

    // tddCreated subscription
    this.subscriptions.add(
      this.desmold.desmoHub.tddCreated$.subscribe((event) => {
        this.tableData[0] = {
          address: event.key,
          url: event.url,
          state: !event.disabled,
        };
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
      this.desmold.desmoHub.tddDisabled$.subscribe((event) => {
        this.tableData[0] = {
          address: event.key,
          url: event.url,
          state: false,
        };

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
      this.desmold.desmoHub.tddEnabled$.subscribe((event) => {
        this.tableData[0] = {
          address: event.key,
          url: event.url,
          state: true,
        };

        // Save new data inside the cache:
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));

        this.dataSource = new MatTableDataSource<TDD>(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = true;
        this.loading = false;
      })
    );

    await this.getTDD();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  registerTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmold.desmoHub.registerTDD(this.tddUrl);
        this.loading = true;
      }
    });
  }

  disableTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmold.desmoHub.disableTDD();
        this.loading = true;
      }
    });
  }

  enableTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmold.desmoHub.enableTDD();
        this.loading = true;
      }
    });
  }

  async getTDD(): Promise<void> {
    let retrievedTDD: ITDD;
    try {
      retrievedTDD = await this.desmold.desmoHub.getTDD();
    } catch (error) {
      this.tddRetrieved = false;
      throw new Error(
        `Unable to retrieve your TDD. You may need to register one. Error message: ${error}`
      );
    }

    this.tableData[0] = {
      address: retrievedTDD.owner,
      url: retrievedTDD.url,
      state: !retrievedTDD.disabled,
    };

    // Save new data inside the cache:
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));

    this.dataSource = new MatTableDataSource<TDD>(this.tableData);
    this.tddRetrieved = true;
    this.tddEnabled = !retrievedTDD.disabled;
  }
}
