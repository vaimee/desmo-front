import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';

interface TDD {
  address: string;
  url: string;
  state: boolean;
  score: number;
}

export class TDDStatisticsDataSource implements DataSource<TDD> {
  private tddSubject = new BehaviorSubject<TDD[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new Subject<void>();

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private desmold: DesmoldSDKService) {}

  connect(collectionViewer: CollectionViewer): Observable<TDD[]> {
    return this.tddSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.tddSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
  }

  async loadTDDs(pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);

    this.tddSubject.next([]); // Empties the table

    const start = pageIndex * pageSize;
    const stop = start + pageSize;
    try {
      const rawTDDs = await this.desmold.desmoHub.getTDDList(start, stop);
      const tdds = rawTDDs.map(({ owner, disabled, score, url }) => ({
        address: owner,
        url,
        state: !disabled,
        score: score.toNumber(),
      }));

      this.tddSubject.next(tdds); // Shows results in the table
    } catch (error) {
      this.errorSubject.next(); // Signals the error
    } finally {
      this.loadingSubject.next(false);
    }
  }
}
