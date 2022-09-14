import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { DesmoHub, WalletSignerJsonRpc } from '@vaimee/desmold-sdk';

export interface TDDDisabled {
  transactionHash: string;
  owner: string;
  url: string;
}

export class TDDDisabledDataSource implements DataSource<TDDDisabled> {
  private txSubject = new BehaviorSubject<TDDDisabled[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new Subject<void>();

  private txList: TDDDisabled[] = [];

  private desmoHub: DesmoHub;

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor() {
    const walletSigner = new WalletSignerJsonRpc('https://viviani.iex.ec');
    this.desmoHub = new DesmoHub(walletSigner);
  }

  connect(collectionViewer: CollectionViewer): Observable<TDDDisabled[]> {
    return this.txSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.txSubject.complete();
    this.loadingSubject.complete();
    this.errorSubject.complete();
  }

  async loadEvents(pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);

    this.txSubject.next([]); // Empties the table

    const start = pageIndex * pageSize;
    const stop = start + pageSize;
    try {
      if (this.getLength() <= 0) {
        this.txList = await this.getAllEvents();
      }

      this.txSubject.next(this.txList.slice(start, stop)); // Shows results in the table
    } catch (error) {
      console.error(error);
      this.errorSubject.next(); // Signals the error
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async getAllEvents(): Promise<TDDDisabled[]> {
    const contract = this.desmoHub['contract'];
    const queryFilter = contract.filters.TDDDisabled();
    const events = await contract.queryFilter(queryFilter);
    return events.map((event: any) => {
      return {
        transactionHash: event.transactionHash,
        owner: event.args['key'],
        url: event.args['url'],
      } as TDDDisabled;
    });
  }

  public getLength() {
    return this.txList.length;
  }
}
