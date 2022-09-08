import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, tap } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { StatisticsDataSource } from './statistics-datasource';

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.css'],
})
export class StatisticsPageComponent
  implements AfterViewInit, OnInit, OnDestroy
{
  displayedColumns: string[] = ['address', 'url', 'state', 'score'];
  dataSource: StatisticsDataSource;
  private subscriptions: Subscription;
  amountOfTDDs: number = 0;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(
    private desmold: DesmoldSDKService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new StatisticsDataSource(this.desmold);
    this.subscriptions = new Subscription();
  }

  private showErrorToast() {
    this.snackBar.open('Error while loading TDDs...', 'Dismiss', {
      duration: 3000,
    });
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.paginator.page.pipe(tap(() => this.loadTDDsPage())).subscribe()
    );
  }

  async ngOnInit(): Promise<void> {
    this.subscriptions.add(
      this.dataSource.error$.subscribe(() => this.showErrorToast())
    );

    this.amountOfTDDs = (
      await this.desmold.desmoHub.getTDDStorageLength()
    ).toNumber();
    await this.dataSource.loadTDDs(0, this.paginator.pageSize);
  }

  async loadTDDsPage() {
    await this.dataSource.loadTDDs(
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
