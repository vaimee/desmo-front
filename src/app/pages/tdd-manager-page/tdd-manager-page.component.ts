import { DesmoHubService } from './../../services/desmo-hub/desmo-hub.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../component-utils/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs';

export interface TDD {
  address: string;
  url: string;
  state: boolean;
}

@Component({
  selector: 'app-tdd-manager-page',
  templateUrl: './tdd-manager-page.component.html',
  styleUrls: ['./tdd-manager-page.component.css'],
})
export class TddManagerPageComponent implements OnInit, OnDestroy {
  tddUrl = '';
  displayedColumns: string[] = ['address', 'url', 'state'];
  tableData: TDD[] = [];
  dataSource = new MatTableDataSource<TDD>([]);

  tddRetrieved: boolean = false;
  tddEnabled: boolean = true;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private desmoHub: DesmoHubService
  ) {}

  ngOnInit(): void {
    // tddCreated subscription
    this.subscriptions.add(
      this.desmoHub.tddCreated$.subscribe((event) => {
        this.tableData.push({
          address: event.key,
          url: event.url,
          state: true,
        });
        this.dataSource = new MatTableDataSource(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = true;
        this.openSnackBar('A new TDD was created!', 'Ok');
      })
    );

    // tddDisabled subscription
    this.subscriptions.add(
      this.desmoHub.tddDisabled$.subscribe((event) => {
        const rowIndex: number = this.tableData.findIndex(
          (tdd: TDD) => tdd.address === event.key && tdd.url === event.url
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
        this.dataSource = new MatTableDataSource(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = false;
        this.openSnackBar('A TDD was disabled!', 'Ok');
      })
    );

    // tddEnabled subscription
    this.subscriptions.add(
      this.desmoHub.tddEnabled$.subscribe((event) => {
        const rowIndex: number = this.tableData.findIndex(
          (tdd: TDD) => tdd.address === event.key && tdd.url === event.url
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
        this.dataSource = new MatTableDataSource(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = true;
        this.openSnackBar('A TDD was enabled!', 'Ok');
      })
    );

    // tddRetrieval subscription
    this.subscriptions.add(
      this.desmoHub.tddRetrieval$.subscribe((event) => {
        const rowIndex: number = this.tableData.findIndex(
          (tdd: TDD) => tdd.address === event.owner && tdd.url === event.url
        );
        if (rowIndex >= 0) {
          this.tableData[rowIndex].state = !event.disabled;
        } else {
          this.tableData.push({
            address: event.owner,
            url: event.url,
            state: !event.disabled,
          });
        }
        this.dataSource = new MatTableDataSource(this.tableData);
        this.tddRetrieved = true;
        this.tddEnabled = !event.disabled;
        this.openSnackBar('A TDD was retrieved!', 'Ok');
      })
    );

    // This must be done at the end:
    this.desmoHub.connect();
  }

  private openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
    });
  }

  registerTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmoHub.registerTDD(this.tddUrl);
        this.openSnackBar('The transaction was successfully sent!', 'Ok');
      }
    });
  }

  disableTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmoHub.disableTDD();
        this.openSnackBar('The transaction was successfully sent!', 'Ok');
      }
    });
  }

  enableTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmoHub.enableTDD();
        this.openSnackBar('The transaction was successfully sent!', 'Ok');
      }
    });
  }

  getTDD() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.desmoHub.getTDD();
        this.openSnackBar('The transaction was successfully sent!', 'Ok');
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
