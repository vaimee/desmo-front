import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  tddUrl = '';
  displayedColumns: string[] = ['address', 'url', 'state'];
  dataSource: MatTableDataSource<TDD>;

  tddRetrieved = false;
  tddEnabled = false;
  loading = false;
  private subscriptions: Subscription;

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private desmold: DesmoldSDKService
  ) {
    this.dataSource = new MatTableDataSource<TDD>([]);
    this.subscriptions = new Subscription();
  }

  async ngOnInit(): Promise<void> {
    await this.desmold.isReady;

    if (!this.desmold.desmoHub.isListening) {
      await this.desmold.desmoHub.startListeners();
    }

    // Reset the table when the selected account changes:
    this.subscriptions.add(
      this.desmold.accountsChanged.subscribe(async () => {
        this.dataSource = new MatTableDataSource<TDD>([]);

        // Reset all the flags:
        this.tddRetrieved = false;
        this.tddEnabled = false;
        this.loading = false;

        await this.getTDD();
      })
    );

    // tddCreated subscription
    this.subscriptions.add(
      this.desmold.desmoHub.tddCreated$.subscribe((event) => {
        this.dataSource = new MatTableDataSource<TDD>([
          {
            address: event.key,
            url: event.url,
            state: !event.disabled,
          },
        ]);
        this.tddRetrieved = true;
        this.tddEnabled = !event.disabled;
        this.loading = false;
      })
    );

    // tddDisabled subscription
    this.subscriptions.add(
      this.desmold.desmoHub.tddDisabled$.subscribe((event) => {
        this.dataSource = new MatTableDataSource<TDD>([
          {
            address: event.key,
            url: event.url,
            state: false,
          },
        ]);
        this.tddRetrieved = true;
        this.tddEnabled = false;
        this.loading = false;
      })
    );

    // tddEnabled subscription
    this.subscriptions.add(
      this.desmold.desmoHub.tddEnabled$.subscribe((event) => {
        this.dataSource = new MatTableDataSource<TDD>([
          {
            address: event.key,
            url: event.url,
            state: true,
          },
        ]);
        this.tddRetrieved = true;
        this.tddEnabled = true;
        this.loading = false;
      })
    );

    await this.getTDD();
  }

  registerTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.desmold.desmoHub.registerTDD(this.tddUrl);
          this.loading = true;
        } catch {
          this.snackBar.open(
            'Unable to register your TDD. You may need to disable the one you already registered.',
            'Dismiss',
            { duration: 3000 }
          );
          return;
        }
      }
    });
  }

  disableTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.desmold.desmoHub.disableTDD();
          this.loading = true;
        } catch {
          this.snackBar.open(
            'Unable disable your TDD. It may be already disabled.',
            'Dismiss',
            { duration: 3000 }
          );
          return;
        }
      }
    });
  }

  enableTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.desmold.desmoHub.enableTDD();
          this.loading = true;
        } catch {
          this.snackBar.open(
            'Unable to enable your TDD. It may be already enabled.',
            'Dismiss',
            { duration: 3000 }
          );
          return;
        }
      }
    });
  }

  async getTDD(): Promise<void> {
    let retrievedTDD: ITDD;
    try {
      retrievedTDD = await this.desmold.desmoHub.getTDD();
      this.snackBar.open('Successfully retrieved your TDD.', 'Dismiss', {
        duration: 3000,
      });
    } catch (error) {
      this.tddRetrieved = false;
      this.snackBar.open(
        'Unable to retrieve your TDD. You may need to register one.',
        'Dismiss',
        { duration: 3000 }
      );
      return;
    }

    this.dataSource = new MatTableDataSource<TDD>([
      {
        address: retrievedTDD.owner,
        url: retrievedTDD.url,
        state: !retrievedTDD.disabled,
      },
    ]);
    this.tddRetrieved = true;
    this.tddEnabled = !retrievedTDD.disabled;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
