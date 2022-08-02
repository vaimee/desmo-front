import { Injectable } from '@angular/core';
import { DesmoContract, DesmoHub, WalletSignerMetamask } from '@vaimee/desmold-sdk';

@Injectable({
  providedIn: 'root',
})
export class DesmoldSDKService {
  private walletSigner: WalletSignerMetamask;
  public desmoHub: DesmoHub;
  public desmoContract: DesmoContract;

  constructor() {
    // @ts-ignore
    this.walletSigner = new WalletSignerMetamask(window.ethereum);
    this.desmoHub = new DesmoHub(this.walletSigner);
    this.desmoContract = new DesmoContract(this.walletSigner);
  }

  public async connect() {
    await this.walletSigner.connect();
  }

  ngOnDestroy() {
    this.desmoHub.stopListeners();
  }

}
