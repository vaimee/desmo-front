import { AfterViewInit, Component, EventEmitter, Output, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, tap } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { TDDStatisticsDataSource } from './tdd-statistics-datasource';

@Component({
  selector: 'app-tdd-list-table',
  templateUrl: './tdd-list-table.component.html',
  styleUrls: ['./tdd-list-table.component.css'],
})
export class TddListTableComponent implements AfterViewInit, OnInit, OnDestroy {
  displayedColumns: string[] = ['address', 'url', 'state', 'score'];
  dataSource: TDDStatisticsDataSource;
  amountOfTDDs: number = 0;

  private subscriptions: Subscription;

  @Output() errorEvent = new EventEmitter<void>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private desmold: DesmoldSDKService) {
    this.dataSource = new TDDStatisticsDataSource(this.desmold);
    this.subscriptions = new Subscription();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.paginator.page.pipe(tap(() => this.loadTDDsPage())).subscribe()
    );
  }

  async ngOnInit(): Promise<void> {
    this.subscriptions.add(
      this.dataSource.error$.subscribe(() => this.errorEvent.emit())
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
