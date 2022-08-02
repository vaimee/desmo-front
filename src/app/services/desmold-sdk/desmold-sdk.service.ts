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
  private walletSigner: WalletSignerMetamask;
  private _desmoHub!: DesmoHub;
  private _desmoContract!: DesmoContract;
  private isConnected: boolean = false;

  get desmoHub() {
    return this._desmoHub;
  }

  get desmoContract() {
    return this._desmoContract;
  }

  constructor() {
    // @ts-ignore
    this.walletSigner = new WalletSignerMetamask(window.ethereum);
  }

  public async connect() {
    if (this.isConnected) return;

    // This needs to be done immediately, in order to prevent other async functions
    // that may have called connect() to execute the subsequent lines of code!
    this.isConnected = true;

    await this.walletSigner.connect();
    this._desmoHub = new DesmoHub(this.walletSigner);
    this._desmoContract = new DesmoContract(this.walletSigner);

    await this._desmoHub.startListeners();
  }

  ngOnDestroy() {
    this.desmoHub.stopListeners();
  }
}
