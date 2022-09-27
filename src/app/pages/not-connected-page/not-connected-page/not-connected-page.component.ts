import { Component, OnInit } from '@angular/core';
import {
  DesmoldSDKService,
  IMetamaskError,
} from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-not-connected-page',
  templateUrl: './not-connected-page.component.html',
  styleUrls: ['./not-connected-page.component.css'],
})
export class NotConnectedPageComponent implements OnInit {
  constructor(
    private desmold: DesmoldSDKService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.desmold.isReady;

    this.checkRedirectCondition();
  }

  public get isMetamaskInstalled(): boolean {
    return this.desmold.isMetamaskInstalled;
  }

  public get isLoggedIn(): boolean {
    return this.desmold.isLoggedIn;
  }

  public get isVivianiChain(): boolean {
    return this.desmold.isVivianiChain;
  }

  public async loginToMetamask(): Promise<void> {
    try {
      await this.desmold.loginToMetamask();

      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as IMetamaskError;
      this.snackBar.open(metamaskError.message, 'Dismiss', {
        duration: 3000,
      });
    }
  }

  public async switchToViviani(): Promise<void> {
    try {
      await this.desmold.switchToVivianiChain();

      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as IMetamaskError;
      this.snackBar.open(metamaskError.message, 'Dismiss', {
        duration: 3000,
      });
    }
  }

  public async addViviani(): Promise<void> {
    try {
      await this.desmold.addVivianiChain();

      this.checkRedirectCondition();
    } catch (error: unknown) {
      const metamaskError = error as IMetamaskError;
      this.snackBar.open(metamaskError.message, 'Dismiss', {
        duration: 3000,
      });
    }
  }

  private checkRedirectCondition(): void {
    if (
      this.desmold.isMetamaskInstalled &&
      this.desmold.isLoggedIn &&
      this.desmold.isVivianiChain
    ) {
      // There's no reason to display this page:
      // let's move to the application's home.
      this.router.navigate(['/']);
    }
  }
}
