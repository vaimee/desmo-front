import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { Desmo, WalletSignerJsonRpc } from '@vaimee/desmold-sdk';

export interface QueryCompleted {
  transactionHash: string;
  requestID: string;
  result: string;
  taskID: string;
}

export class QueryCompletedDataSource implements DataSource<QueryCompleted> {
  private txSubject = new BehaviorSubject<QueryCompleted[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new Subject<void>();

  private txList: QueryCompleted[] = [];

  private desmo: Desmo;

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor() {
    const walletSigner = new WalletSignerJsonRpc('https://viviani.iex.ec');
    this.desmo = new Desmo(walletSigner);
  }

  connect(collectionViewer: CollectionViewer): Observable<QueryCompleted[]> {
    return this.txSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.txSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
  }

  async loadQueries(pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);

    this.txSubject.next([]); // Empties the table

    const start = pageIndex * pageSize;
    const stop = start + pageSize;
    try {
      if (this.getLength() <= 0) {
        this.txList = await this.getAllCompletedQueries();
      }

      this.txSubject.next(this.txList.slice(start, stop)); // Shows results in the table
    } catch (error) {
      console.error(error);
      this.errorSubject.next(); // Signals the error
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async getAllCompletedQueries(): Promise<QueryCompleted[]> {
    const contract = this.desmo['contract'];
    const queryFilter = contract.filters.QueryCompleted();
    const events = await contract.queryFilter(queryFilter);
    return events.map((event: any) => {
      return {
        transactionHash: event.transactionHash,
        requestID: event.args['result'].requestID,
        taskID: event.args['result'].taskID,
        result: event.args['result'].result,
      } as QueryCompleted;
    });
  }

  public getLength() {
    return this.txList.length;
  }
}
