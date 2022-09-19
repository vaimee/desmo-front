import { Component, OnInit, OnDestroy } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Breakpoints,
  BreakpointObserver,
  BreakpointState,
} from '@angular/cdk/layout';
import { DesmoHub, WalletSignerMetamask } from '@vaimee/desmold-sdk';

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
  private walletSigner: WalletSignerMetamask;
  desmoHub: DesmoHub;

  constructor(
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {
    this.walletSigner = new WalletSignerMetamask((window as any).ethereum);
    this.desmoHub = new DesmoHub(this.walletSigner);
  }

  async ngOnInit(): Promise<void> {
    if (!this.desmoHub.isConnected) {
      await this.walletSigner.connect();
      this.desmoHub.connect();
    }
    await this.desmoHub.startListeners();

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

}
