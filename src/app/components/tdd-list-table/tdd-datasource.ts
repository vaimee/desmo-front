import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { DesmoHub, WalletSignerJsonRpc } from '@vaimee/desmold-sdk';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

interface TDD {
  address: string;
  url: string;
  state: boolean;
  score: number;
}

export class TDDDataSource implements DataSource<TDD> {
  private tddSubject = new BehaviorSubject<TDD[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new Subject<void>();
  private desmoHub: DesmoHub;

  private tddStorageLength = 0;

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor() {
    const walletSigner = new WalletSignerJsonRpc('https://viviani.iex.ec');
    this.desmoHub = new DesmoHub(walletSigner);
  }

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
      this.tddStorageLength = (
        await this.desmoHub.getTDDStorageLength()
      ).toNumber();
      const rawTDDs = await this.desmoHub.getTDDList(start, stop);
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

  getLength(): number {
    return this.tddStorageLength;
  }
}
