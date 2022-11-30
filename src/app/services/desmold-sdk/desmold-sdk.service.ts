import { Injectable, NgZone, OnDestroy } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { Desmo, DesmoHub, WalletSignerMetamask } from '@vaimee/desmold-sdk';
import { Observable, Subject } from 'rxjs';

export interface IMetamaskError {
  message: string;
  code: number;
  data?: unknown;
}

export interface IAccountsChangedEvent {
  oldValue: string;
  newValue: string;
}

@Injectable({
  providedIn: 'root',
})
export class DesmoldSDKService implements OnDestroy {
  private _ethProvider: any;
  private _walletSigner?: WalletSignerMetamask;
  private _desmoHub?: DesmoHub;
  private _desmo?: Desmo;
  private _userAddress = 'NOT LOGGED IN';

  // Connection flags:
  private _isMetamaskInstalled = false;
  private _isLoggedIn = false;
  private _isVivianiChain = false;

  // Promises and observables:
  private IS_READY: Promise<void>;
  private ACCOUNTS_CHANGED: Subject<IAccountsChangedEvent>;

  constructor(private ngZone: NgZone) {
    this.ACCOUNTS_CHANGED = new Subject<IAccountsChangedEvent>();
    this.IS_READY = new Promise<void>(async (resolve, reject) => {
      try {
        await this.init();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public get desmoHub(): DesmoHub {
    if (this._desmoHub === undefined) {
      throw new Error(
        "DesmoldSDK service isn't ready: please await the isReady promise!"
      );
    }
    return this._desmoHub;
  }

  public get desmo(): Desmo {
    if (this._desmo === undefined) {
      throw new Error(
        "DesmoldSDK service isn't ready: please await the isReady promise!"
      );
    }
    return this._desmo;
  }

  public get userAddress(): string {
    return this._userAddress;
  }

  // Connection flags:
  public get isLoggedIn() {
    return this._isLoggedIn;
  }

  public get isVivianiChain() {
    return this._isVivianiChain;
  }

  public get isMetamaskInstalled() {
    return this._isMetamaskInstalled;
  }

  // Promises and observables:
  public get isReady(): Promise<void> {
    return this.IS_READY;
  }

  public get accountsChanged(): Observable<IAccountsChangedEvent> {
    return this.ACCOUNTS_CHANGED.asObservable();
  }

  private async init(): Promise<void> {
    try {
      this._ethProvider = await this.getEthereumProvider();
      this._ethProvider.on('chainChanged', (_chainId: number) =>
        window.location.reload()
      );
      this._ethProvider.on('accountsChanged', (accounts: Array<string>) =>
        this.ngZone.run(async () => {
          // Bring event back inside Angular's zone
          await this.handleAccountsChanged(accounts);
        })
      );

      // Set flag isMetamaskInstalled:
      this._isMetamaskInstalled = true;

      // Set flag isLoggedIn:
      const accounts = await this._ethProvider.request({
        method: 'eth_accounts',
      });
      this._isLoggedIn = accounts.length > 0;
      if (this._isLoggedIn) {
        this._userAddress = accounts[0];
      }

      // Set flag isVivianiChain:
      const chainId: string = await this._ethProvider.request({
        method: 'eth_chainId',
      });
      this._isVivianiChain = chainId === '0x86';

      // Initialize SDK interfaces:
      this._walletSigner = new WalletSignerMetamask(this._ethProvider);
      this._desmoHub = new DesmoHub(this._walletSigner);
      this._desmo = new Desmo(this._walletSigner);
    } catch {
      this._isMetamaskInstalled = false;
      this._isLoggedIn = false;
      this._isVivianiChain = false;
    }
  }

  private async handleAccountsChanged(accounts: Array<string>): Promise<void> {
    await this.isReady;

    this._isLoggedIn = accounts.length > 0;
    if (!this._isLoggedIn) {
      // The user disconnected from Metamask:
      // reload the page to restart from scratch.
      window.location.reload();
      return;
    }

    if (
      this._walletSigner !== undefined &&
      this._desmoHub !== undefined &&
      this._desmo !== undefined
    ) {
      if (!this._walletSigner.isConnected) {
        await this._walletSigner.connect();
        this._desmoHub.connect();
        this._desmo.connect();
      }

      if (this._desmoHub.isListening) {
        this._desmoHub.stopListeners();
        await this._desmoHub.startListeners();
      }
    }

    // Update the user address and emit the event:
    this.ACCOUNTS_CHANGED.next({
      oldValue: this._userAddress,
      newValue: accounts[0],
    });
    this._userAddress = accounts[0];
  }

  public async loginToMetamask(): Promise<void> {
    await this._ethProvider.request({ method: 'eth_requestAccounts' });
  }

  public async switchToVivianiChain(): Promise<void> {
    await this._ethProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x86' }],
    });
  }

  public async addVivianiChain(): Promise<void> {
    await this._ethProvider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x86',
          chainName: 'bellecour',
          rpcUrls: ['https://bellecour.iex.ec'],
          blockExplorerUrls: ['https://blockscout-bellecour.iex.ec/'],
          nativeCurrency: {
            symbol: 'RLC',
            decimals: 18,
          },
        },
      ],
    });
  }

  private async getEthereumProvider(): Promise<unknown> {
    const provider: unknown = await detectEthereumProvider({
      mustBeMetaMask: true,
      silent: false,
      timeout: 3000,
    });
    return provider;
  }

  ngOnDestroy() {
    if (this.desmoHub?.isListening) {
      this.desmoHub.stopListeners();
    }
  }
}
