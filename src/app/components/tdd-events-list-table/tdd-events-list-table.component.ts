import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, tap } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';

interface ITDDEvent {
  blockNumber: number;
  transactionHash: string;
  owner: string;
  url: string;
  log: string;
}

@Component({
  selector: 'app-tdd-events-list-table',
  templateUrl: './tdd-events-list-table.component.html',
  styleUrls: ['./tdd-events-list-table.component.css'],
})
export class TddEventsListTableComponent implements AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['blockNumber', 'txHash', 'log', 'owner', 'url'];

  dataSource: MatTableDataSource<ITDDEvent>;
  private txList: ITDDEvent[] = [];
  loading = false;

  private subscriptions: Subscription;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(
    private desmold: DesmoldSDKService,
    private cd: ChangeDetectorRef
  ) {
    this.dataSource = new MatTableDataSource<ITDDEvent>(this.txList);
    this.subscriptions = new Subscription();
  }

  async ngAfterViewInit() {
    this.subscriptions.add(
      this.paginator.page
        .pipe(
          tap(() =>
            this.loadPage(this.paginator.pageIndex, this.paginator.pageSize)
          )
        )
        .subscribe()
    );

    this.loading = true;
    this.cd.detectChanges(); // Needed because we're in the AfterViewInit lifecycle hook!

    await this.getAllTDDEvents();
    await this.loadPage(0, this.paginator.pageSize);

    this.loading = false;
    this.cd.detectChanges(); // Needed because we're in the AfterViewInit lifecycle hook!
  }

  private async getAllTDDEvents(): Promise<void> {
    const contract = this.desmold.desmoHub['contract'];
    let queryFilter = contract.filters.TDDCreated();
    let events = await contract.queryFilter(queryFilter);
    const tddCreatedEvents = events.map((event: any) => {
      return {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        owner: event.args['key'],
        url: event.args['url'],
        log: `A new TDD was REGISTERED`,
      } as ITDDEvent;
    });

    queryFilter = contract.filters.TDDEnabled();
    events = await contract.queryFilter(queryFilter);
    const tddEnabledEvents = events.map((event: any) => {
      return {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        owner: event.args['key'],
        url: event.args['url'],
        log: `The TDD was ENABLED`,
      } as ITDDEvent;
    });

    queryFilter = contract.filters.TDDDisabled();
    events = await contract.queryFilter(queryFilter);
    const tddDisabledEvents = events.map((event: any) => {
      return {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        owner: event.args['key'],
        url: event.args['url'],
        log: `The TDD was DISABLED`,
      } as ITDDEvent;
    });

    // Descending order: more recent events first!
    this.txList = tddCreatedEvents
      .concat(tddEnabledEvents)
      .concat(tddDisabledEvents)
      .sort((a: ITDDEvent, b: ITDDEvent) => b.blockNumber - a.blockNumber);
  }

  private async loadPage(pageIndex: number, pageSize: number) {
    this.dataSource.data = []; // Empties the table

    const start = pageIndex * pageSize;
    const stop = start + pageSize;

    // Show results in the table:
    this.dataSource.data = this.txList.slice(start, stop);
  }

  public get dataLength(): number {
    return this.txList.length;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
