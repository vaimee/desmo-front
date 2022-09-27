import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { DesmoldSDKService } from './services/desmold-sdk/desmold-sdk.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'desmo-front';
  private subscriptions: Subscription;

  constructor(
    private desmold: DesmoldSDKService,
    private snackBar: MatSnackBar
  ) {
    this.subscriptions = new Subscription();
  }

  async ngOnInit(): Promise<void> {
    await this.desmold.isReady;

    this.subscriptions.add(
      this.desmold.accountsChanged.subscribe(() => {
        this.snackBar.open('The account was successfully changed.', 'Dismiss', {
          duration: 3000,
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
