import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { Component, OnInit } from '@angular/core';
import IQuery, { defaultIQuery } from 'src/app/interface/IQuery';
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

  private query: IQuery;
  private subscriptions: Subscription;

  constructor(
    private desmold: DesmoldSDKService,
    private snackBar: MatSnackBar
  ) {
    this.query = defaultIQuery();
    this.result = defaultIResult();
    this.resultTable = defaultIResultTable();
    this.subscriptions = new Subscription();
  }

  public async ngOnInit(): Promise<void> {
    await this.desmold.isReady;

    if (!this.desmold.desmoHub.isListening) {
      await this.desmold.desmoHub.startListeners();
    }

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
  }

  public async executeQuery(query: IQuery) {
    this.result.loading = true;
    this.resultTable = defaultIResultTable();

    this.query = query;
    await this.computeQuery();
  }

  private async computeQuery() {
    this.stepperIndex = 0;
    const eventPromise = firstValueFrom(this.desmold.desmoHub.requestID$);
    await this.desmold.desmoHub.getNewRequestID();
    const event = await eventPromise;
    this.result.requestId = event.requestID;
    this.notifySentTransaction('new request ID received');

    this.stepperIndex = 1;
    const queryToSend: string = this.encodeQuery(this.query);
    await this.desmold.desmo.buyQuery(
      this.result.requestId,
      queryToSend,
      environment.iExecDAppAddress
    );
    this.notifySentTransaction('Query successfully sent');

    this.stepperIndex = 2;
    const { result, type } = await this.desmold.desmo.getQueryResult();
    if (this.stepperIndex === 0) {
      this.notifySentTransaction('Query failed');
      this.resultReset();
      return;
    }
    this.notifySentTransaction('Query result received');
    const elapsedTime = this.elapsed(this.start);
    this.queryCompleted(result, type, elapsedTime);
    this.stepperIndex = 4;
  }

  private queryCompleted(
    value: number | string,
    type: QueryResultTypes,
    elapsedTime: number
  ): void {
    this.result.loading = false;
    this.result.arrived = true;
    this.result.data.value = value;
    this.result.data.type = type;
    this.result.elapsedTime = elapsedTime;
    this.result.query = this.query;
    const resultTable: IResultTable = {
      property: this.query.property.identifier,
      value: value,
      unit: this.query.property.unit,
      time: this.result.elapsedTime,
    };
    this.resultTable.push(resultTable);
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
