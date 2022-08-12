import { Injectable } from '@angular/core';
import {
  DesmoContract,
  DesmoHub,
  WalletSignerMetamask,
} from '@vaimee/desmold-sdk';

@Injectable({
  providedIn: 'root',
})
export class DesmoldSDKService {
  private _walletSigner: WalletSignerMetamask;
  private _desmoHub: DesmoHub;
  private _desmoContract: DesmoContract;
  private _isConnected: boolean = false;

  constructor() {
    // @ts-ignore
    this._walletSigner = new WalletSignerMetamask(window.ethereum);
    this._isConnected = this._walletSigner.isConnected;

    this._desmoHub = new DesmoHub(this._walletSigner);
    this._desmoContract = new DesmoContract(this._walletSigner);

    // @ts-ignore
    window.ethereum.on('chainChanged', (chainId: number) => window.location.reload());
    // @ts-ignore
    window.ethereum.on('accountsChanged', (accounts: Array<string>) => window.location.reload());
  }

  public get desmoHub(): DesmoHub {
    return this._desmoHub;
  }

  public get desmoContract(): DesmoContract {
    return this._desmoContract;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public async connect() {
    if (this.isConnected) {
      if (!this._desmoHub.isListening) {
        await this._desmoHub.startListeners();
      }
      return;
    }

    // This needs to be done immediately, in order to prevent other async functions
    // that may have called connect() to execute the subsequent lines of code!
    this._isConnected = true;

    await this._walletSigner.connect();
    this._desmoHub.connect();
    this._desmoContract.connect();

    await this._desmoHub.startListeners();
  }

  ngOnDestroy() {
    this.desmoHub.stopListeners();
  }
}
