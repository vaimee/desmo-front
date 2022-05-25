import { Injectable } from '@angular/core';
import { ethers } from 'ethers';

@Injectable({
  providedIn: 'root',
})
export class DesmoHubService {
  private provider: any;
  private signer: any;
  private contract: any;
  private contractWithSigner: any;
  private readonly contractAddress: string = 'dai.tokens.ethers.eth';

  private readonly desmoHubAbi: string[] = [
    'function registerTDD(TDD memory tdd) external returns (uint256 index)',
    'function unregisterTDD(uint256 index) external',
    'function getNewRequestID() external returns (uint256)',
    'function getTDDByRequestID(uint256 key) public view returns (string[] memory)',
    "event Registered(address owner, uint256 index, string url)",
    "event Unregistered(uint256 index, string url)"
  ];

  constructor() {}

  public async connect() {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    // @ts-ignore
    this.provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    await this.provider.send('eth_requestAccounts', []);

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    this.signer = this.provider.getSigner();

    // The Contract object
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.desmoHubAbi,
      this.provider
    );
    this.contractWithSigner = this.contract.connect(this.signer);
  }

  public async registerTDD(tddUrl: string): Promise<void> {
    if (this.contractWithSigner) {
      // A filter for when a specific address receives tokens
      const ownerAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
      const filter = this.contract.filters.Registered(ownerAddress, null, null)

      // Receive an event when that filter occurs
      this.contract.on(filter, (owner: any, index: any, url: any, event: any) => {
          console.log(`A TDD was registered! Owner: ${ owner } Url: ${ url }.`);
      });

      const tx = await this.contractWithSigner.registerTDD({
        url: 'https://the.best.tdds.in.the.world.com/tdd42',
        owner: ownerAddress,
      });
    }
  }

  public async unregisterTDD(index: string): Promise<void> {
    if (this.contractWithSigner) {
      // A filter for when a specific address receives tokens
      const index = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
      const filter = this.contract.filters.Unregistered(index, null)

      // Receive an event when that filter occurs
      this.contract.on(filter, (index: any, url: any, event: any) => {
          console.log(`A TDD was unregistered! Index: ${ index } Url: ${ url }.`);
      });

      const tx = await this.contractWithSigner.unregisterTDD(index);
    }
  }

}
