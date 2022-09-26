import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

type EventType = 'CREATE' | 'DISABLE' | 'ENABLE' | 'RETRIEVE';
const eventMessages: Record<EventType, string> = {
  CREATE: 'A new TDD was created!',
  DISABLE: 'The selected TDD was disabled!',
  ENABLE: 'The selected TDD was enabled!',
  RETRIEVE: 'An existing TDD was found!',
};

@Component({
  selector: 'app-tdd-manager-page',
  templateUrl: './tdd-manager-page.component.html',
  styleUrls: ['./tdd-manager-page.component.css'],
})
export class TddManagerPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  isSmallScreen = false;

  constructor(
    private desmold: DesmoldSDKService,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {}

  async ngOnInit(): Promise<void> {
    await this.desmold.connect();

    /** Based on the screen size, switch from standard to one column per row */
    this.subscriptions.add(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
        .subscribe(({ matches }) => (this.isSmallScreen = matches))
    );
    this.subscriptions.add(
      this.desmold.desmoHub.tddCreated$.subscribe(() =>
        this.notifyTDDEvent('CREATE')
      )
    );
    this.subscriptions.add(
      this.desmold.desmoHub.tddDisabled$.subscribe(() =>
        this.notifyTDDEvent('DISABLE')
      )
    );
    this.subscriptions.add(
      this.desmold.desmoHub.tddEnabled$.subscribe(() =>
        this.notifyTDDEvent('ENABLE')
      )
    );
    this.subscriptions.add(
      this.desmold.desmoHub.transactionSent$.subscribe(() =>
        this.notifySentTransaction()
      )
    );
  }

  private notifySentTransaction() {
    this.snackBar.open('A new transaction was sent.', 'Dismiss', {
      duration: 3000,
    });
  }

  private notifyTDDEvent(typeKey: EventType) {
    this.snackBar.open(eventMessages[typeKey], 'Dismiss', {
      duration: 3000,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
