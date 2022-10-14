import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import IQuery from 'src/app/interface/IQuery';
import { Subscription, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  IResult,
  IResultTable,
  QueryResultTypes,
  defaultIResult,
  defaultIResultTable,
} from 'src/app/interface/IResult';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bytes } from 'ethers';
import { MatDialog } from '@angular/material/dialog';
import { QueryResumeDialogComponent } from 'src/app/components/query-resume-dialog/query-resume-dialog.component';

interface IQueryState {
  executing: boolean;
  checkPoint: number;

  query?: IQuery;
  requestID?: Bytes;
}

@Component({
  selector: 'app-query-page',
  templateUrl: './query-page.component.html',
  styleUrls: ['./query-page.component.css'],
})
export class QueryPageComponent implements OnInit {
  result: IResult;

  displayedColumns: string[] = ['property', 'value', 'unit', 'time'];
  resultTable: IResultTable[];
  start = 0;

  stepperIndex = 0;

  private subscriptions: Subscription;
  private queryStateDict: Record<string, IQueryState>;
  private currentUserAddress = '';
  private readonly CACHE_KEY = 'queryState';

  constructor(
    private desmold: DesmoldSDKService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {
    this.result = defaultIResult();
    this.resultTable = defaultIResultTable();
    this.subscriptions = new Subscription();

    // Check the cache for pre-existing data or initialise with an empty object:
    const cachedValueStr: string = localStorage.getItem(this.CACHE_KEY) ?? '{}';
    this.queryStateDict = JSON.parse(cachedValueStr) as Record<
      string,
      IQueryState
    >;
  }

  public async ngOnInit(): Promise<void> {
    await this.desmold.isReady;

    if (!this.desmold.desmoHub.isListening) {
      await this.desmold.desmoHub.startListeners();
    }

    this.currentUserAddress = this.desmold.userAddress;

    this.subscriptions.add(
      this.desmold.accountsChanged.subscribe(async ({ newValue }) => {
        if (this.result.loading === true) {
          // User changed wallet during the execution of a query:
          // the best thing to do is to force the page to reload
          // so that every piece of code that is still running gets
          // immediately stopped.
          window.location.reload();
        } else {
          this.currentUserAddress = newValue;
          await this.checkForUnfinishedQueryExecution();
        }
      })
    );

    this.subscriptions.add(
      this.desmold.desmo.queryState.subscribe((state: any) => {
        if (state.state === 'TASK_UPDATED') {
          this.notifySentTransaction('The task is processing...');
        }
        if (state.state === 'TASK_COMPLETED') {
          this.stepperIndex = 3;
          this.notifySentTransaction('The task is completed');
        }
        if (state.state === 'TASK_FAILED') {
          this.stepperIndex = 0;
          this.notifySentTransaction('The task has failed');
        }
        if (state.state === 'TASK_TIMEDOUT') {
          this.stepperIndex = 0;
          this.notifySentTransaction('The task took too long to complete');
        }
      })
    );

    // Before (potentially) starting a query execution process,
    // we need to set all needed subscriptions. This is why
    // the following line is the last one inside this function:
    await this.checkForUnfinishedQueryExecution();
  }

  private async checkForUnfinishedQueryExecution(): Promise<void> {
    if (this.queryStateDict[this.currentUserAddress] === undefined) {
      // Initialize the query state data structure
      // for the currently-selected user:
      this.resetQueryState();
    }

    if (this.queryStateDict[this.currentUserAddress].executing === true) {
      const dialogRef = this.dialog.open(QueryResumeDialogComponent, {
        disableClose: true,
        autoFocus: true,
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.continueQueryExecution();
        } else {
          this.resetQueryState();
        }
      });
    }
  }

  public async executeQuery(query: IQuery): Promise<void> {
    if (this.queryStateDict[this.currentUserAddress].executing === true) {
      throw new Error(
        "Cannot execute query until the current one isn't finished."
      );
    }

    this.result.loading = true;
    this.resultTable = defaultIResultTable();

    const requestID: Bytes = await this.executeFirstPhase();
    this.saveFirstCheckPoint(query, requestID);

    await this.executeSecondPhase(query, requestID);

    this.result.loading = false;
  }

  private saveFirstCheckPoint(query: IQuery, requestID: Bytes) {
    this.queryStateDict[this.currentUserAddress].executing = true;
    this.queryStateDict[this.currentUserAddress].checkPoint = 1;
    this.queryStateDict[this.currentUserAddress].query = query;
    this.queryStateDict[this.currentUserAddress].requestID = requestID;

    // Persist the current state:
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.queryStateDict));
  }

  private async continueQueryExecution() {
    if (this.queryStateDict[this.currentUserAddress].checkPoint === 0) {
      throw new Error(
        "Cannot continue executing a query that didn't even start."
      );
    } else if (this.queryStateDict[this.currentUserAddress].checkPoint === 1) {
      const curUserQuery = this.queryStateDict[this.currentUserAddress].query;
      const curUserRequestID =
        this.queryStateDict[this.currentUserAddress].requestID;
      if (curUserQuery === undefined || curUserRequestID === undefined) {
        throw new Error(
          'Invalid query state: query or requestID missing at first checkpoint.'
        );
      }
      const query: IQuery = curUserQuery;
      const requestID: Bytes = curUserRequestID;

      this.result.loading = true;
      this.resultTable = defaultIResultTable();

      this.stepperIndex = 0;
      // Apparently, this is needed otherwise the previous line has no visual effect:
      this.cd.detectChanges();

      await this.executeSecondPhase(query, requestID);

      this.result.loading = false;
    }
  }

  private async executeFirstPhase(): Promise<Bytes> {
    this.stepperIndex = 0;
    const eventPromise = firstValueFrom(this.desmold.desmoHub.requestID$);
    await this.desmold.desmoHub.getNewRequestID();
    const event = await eventPromise;
    this.result.requestId = event.requestID;
    this.notifySentTransaction('New request ID obtained.');

    return event.requestID;
  }

  private async executeSecondPhase(
    query: IQuery,
    requestID: Bytes
  ): Promise<void> {
    this.stepperIndex = 1;
    const queryToSend: string = this.encodeQuery(query);
    await this.desmold.desmo.buyQuery(
      requestID,
      queryToSend,
      environment.iExecDAppAddress
    );
    this.notifySentTransaction('Query successfully sent.');

    this.stepperIndex = 2;
    try {
      const { result, type } = await this.desmold.desmo.getQueryResult();

      this.notifySentTransaction('Query result received.');
      const elapsedTime = this.elapsed(this.start);
      this.queryCompleted(query, result, type, elapsedTime);
      this.stepperIndex = 4;
    } catch {
      this.notifySentTransaction('Query execution failed.');
      this.resultReset();
    } finally {
      // Query execution terminated (successfully or not).
      // Let's reset the cached query state!
      this.resetQueryState();
    }
  }

  private queryCompleted(
    query: IQuery,
    value: number | string,
    type: QueryResultTypes,
    elapsedTime: number
  ): void {
    this.result.loading = false;
    this.result.arrived = true;
    this.result.data.value = value;
    this.result.data.type = type;
    this.result.elapsedTime = elapsedTime;
    this.result.query = query;
    const resultTable: IResultTable = {
      property: query.property.identifier,
      value: value,
      unit: query.property.unit,
      time: this.result.elapsedTime,
    };
    this.resultTable.push(resultTable);
  }

  private resetQueryState() {
    const initialQueryState: IQueryState = {
      executing: false,
      checkPoint: 0,
    };
    this.queryStateDict[this.currentUserAddress] = initialQueryState;

    // Persist the current state:
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.queryStateDict));
  }

  private resultReset(): void {
    this.result = defaultIResult();
    this.resultTable = defaultIResultTable();
  }

  private encodeQuery(query: IQuery): string {
    const queryString: string = JSON.stringify(query);
    const transformedQuery: string = queryString
      .trim()
      .replace(/\"/gm, '__!_')
      .replace(/'/gm, '--#-'); // temporary solution to avoid problems with quotes: https://github.com/vaimee/desmo-dapp/issues/1
    console.log(transformedQuery);
    return transformedQuery;
  }

  private now(): number {
    return new Date().getTime();
  }

  private elapsed(start: number): number {
    return this.now() - start;
  }

  private notifySentTransaction(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 1000,
    });
  }
}
