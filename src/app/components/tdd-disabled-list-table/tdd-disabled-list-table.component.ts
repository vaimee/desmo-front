import {
  Component,
  EventEmitter,
  Output,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, tap } from 'rxjs';
import { TDDDisabledDataSource } from './tdddisabled-datasource';

@Component({
  selector: 'app-tdd-disabled-list-table',
  templateUrl: './tdd-disabled-list-table.component.html',
  styleUrls: ['./tdd-disabled-list-table.component.css']
})
export class TddDisabledListTableComponent implements OnInit, OnDestroy, AfterViewInit
  {
    displayedColumns: string[] = ['blockNumber', 'txHash', 'owner', 'url'];
    dataSource: TDDDisabledDataSource;
    loading = false;

    private subscriptions: Subscription;

    @Output() errorEvent = new EventEmitter<void>();

    @ViewChild(MatPaginator)
    paginator!: MatPaginator;

    constructor(private cd: ChangeDetectorRef) {
      this.dataSource = new TDDDisabledDataSource();
      this.subscriptions = new Subscription();
    }

    async ngOnInit(): Promise<void> {
      this.subscriptions.add(
        this.dataSource.error$.subscribe(() => this.errorEvent.emit())
      );
      this.subscriptions.add(
        this.dataSource.loading$.subscribe((loading) => {
          this.loading = loading;
          /**
           * The loading$ observable emits values at the
           * AfterViewInit lifecycle hook. We need to run
           * again the change detector since the loading
           * flag has an impact on the view!
           */
          this.cd.detectChanges();
        })
      );
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
      await this.loadPage(0, this.paginator.pageSize);
    }

    private async loadPage(pageIndex: number, pageSize: number) {
      await this.dataSource.loadEvents(pageIndex, pageSize);
      /**
       * Calling the loadQueries method of the data source
       * results in the dataSource.getLength() value being
       * updated. Since such value has an impact on the view
       * and -most importantly- such method gets called once at
       * the AfterViewInit lifecycle hook, we need to run
       * again the change detector!
       */
      this.cd.detectChanges();
    }

    ngOnDestroy() {
      this.subscriptions.unsubscribe();
    }
  }

