import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, tap } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { StatisticsDataSource } from './statistics-datasource';

export interface TDD {
  address: string;
  url: string;
  state: boolean;
  score: number;
}

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

  constructor(private desmold: DesmoldSDKService) {
    this.dataSource = new StatisticsDataSource(this.desmold);
    this.subscriptions = new Subscription();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.paginator.page.pipe(tap(() => this.loadTDDsPage())).subscribe()
    );
  }

  async ngOnInit(): Promise<void> {
    this.amountOfTDDs = (await this.desmold.desmoHub.getTDDStorageLength()).toNumber();
    await this.dataSource.loadTDDs(0, 5);
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
