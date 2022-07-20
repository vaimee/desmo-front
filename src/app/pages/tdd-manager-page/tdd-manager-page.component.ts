import { DesmoHubService } from 'src/app/services/desmo-hub/desmo-hub.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Breakpoints,
  BreakpointObserver,
  BreakpointState,
} from '@angular/cdk/layout';
import { ethers } from 'ethers';

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
  isSmallScreen: boolean = false;

  constructor(
    private desmoHub: DesmoHubService,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    /** Based on the screen size, switch from standard to one column per row */
    this.subscriptions.add(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
        .subscribe(({ matches }) => (this.isSmallScreen = matches))
    );
    this.subscriptions.add(
      this.desmoHub.tddCreated$.subscribe(() => this.notifyTDDEvent('CREATE'))
    );
    this.subscriptions.add(
      this.desmoHub.tddDisabled$.subscribe(() => this.notifyTDDEvent('DISABLE'))
    );
    this.subscriptions.add(
      this.desmoHub.tddEnabled$.subscribe(() => this.notifyTDDEvent('ENABLE'))
    );
    this.subscriptions.add(
      this.desmoHub.tddRetrieval$.subscribe(() =>
        this.notifyTDDEvent('RETRIEVE')
      )
    );
    this.subscriptions.add(
      this.desmoHub.transactionSent$.subscribe(() =>
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

  private increaseHexByOne(hex: string) {
    return ethers.BigNumber.from(hex).add(1).toHexString();
  }

  async testFunction() {
    await this.desmoHub.readStorage();   
  }
}
