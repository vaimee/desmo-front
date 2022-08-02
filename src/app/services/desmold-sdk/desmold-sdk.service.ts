import { Injectable } from '@angular/core';
import { DesmoContract, DesmoHub, WalletSignerMetamask } from '@vaimee/desmold-sdk';

@Injectable({
  providedIn: 'root',
})
export class DesmoldSDKService {
  private walletSigner: WalletSignerMetamask;
  private _desmoHub: DesmoHub;
  private _desmoContract: DesmoContract;

  get desmoHub(){
    return this._desmoHub;
  }

  get desmoContract(){
    return this._desmoContract;
  }
  constructor() {
    // @ts-ignore
    this.walletSigner = new WalletSignerMetamask(window.ethereum);
    this._desmoHub = new DesmoHub(this.walletSigner);
    this._desmoContract = new DesmoContract(this.walletSigner);
  }

  public async connect() {
    await this.walletSigner.connect();
  }

  ngOnDestroy() {
    this.desmoHub.stopListeners();
  }

}
