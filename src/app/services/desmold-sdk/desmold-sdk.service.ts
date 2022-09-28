import { Injectable, OnDestroy } from '@angular/core';
import { Desmo, DesmoHub, WalletSignerMetamask } from '@vaimee/desmold-sdk';

@Injectable({
  providedIn: 'root',
})
export class DesmoldSDKService implements OnDestroy {
  private _walletSigner: WalletSignerMetamask;
  private _desmoHub: DesmoHub;
  private _desmoContract: Desmo;
  private _isConnected = false;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._walletSigner = new WalletSignerMetamask(window.ethereum);
    this._isConnected = this._walletSigner.isConnected;

    this._desmoHub = new DesmoHub(this._walletSigner);
    this._desmoContract = new Desmo(this._walletSigner);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ethereum.on('chainChanged', (chainId: number) =>
      window.location.reload()
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ethereum.on('accountsChanged', (accounts: Array<string>) =>
      window.location.reload()
    );
  }

  public get desmoHub(): DesmoHub {
    return this._desmoHub;
  }

  public get desmoContract(): Desmo {
    return this._desmoContract;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public async connect() {
    if (this.isConnected) {
      if (!this.desmoHub.isListening) {
        await this.desmoHub.startListeners();
      }
      return;
    }

    // This needs to be done immediately, in order to prevent other async functions
    // that may have called connect() to execute the subsequent lines of code!
    this._isConnected = true;

    await this._walletSigner.connect();
    this.desmoHub.connect();
    this.desmoContract.connect();

    await this.desmoHub.startListeners();
  }

  ngOnDestroy() {
    if (this.desmoHub.isListening) {
      this.desmoHub.stopListeners();
    }
  }
}
