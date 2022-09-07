import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { TDD } from './statistics-page.component';

export class StatisticsDataSource implements DataSource<TDD> {
  private tddSubject = new BehaviorSubject<TDD[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private desmold: DesmoldSDKService) {}

  connect(collectionViewer: CollectionViewer): Observable<TDD[]> {
    return this.tddSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.tddSubject.complete();
    this.loadingSubject.complete();
  }

  async loadTDDs(pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);

    const start = pageIndex * pageSize;
    const stop = start + pageSize;
    try {
      const rawTDDs = await this.desmold.desmoHub.getTDDList(start, stop);
      const tdds = rawTDDs.map(({owner, disabled, score, url}) => ({address: owner, url, state: !disabled, score: score.toNumber()}));

      this.tddSubject.next(tdds);
    } catch {
      this.tddSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }
}
