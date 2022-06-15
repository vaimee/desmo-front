import {
  ITDDCreatedEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
  ITDDRetrievalEvent,
} from './desmo-hub.types';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { desmoHubABI } from './desmoHubABI';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DesmoHubService {
  private provider: any;
  private signer: any;
  private contract: any;
  private contractWithSigner: any;

  private TDD_CREATED: Subject<ITDDCreatedEvent>;
  tddCreated$: Observable<ITDDCreatedEvent>;

  private TDD_DISABLED: Subject<ITDDDisabledEvent>;
  tddDisabled$: Observable<ITDDDisabledEvent>;

  private TDD_ENABLED: Subject<ITDDEnabledEvent>;
  tddEnabled$: Observable<ITDDEnabledEvent>;

  private TDD_RETRIEVAL: Subject<ITDDRetrievalEvent>;
  tddRetrieval$: Observable<ITDDRetrievalEvent>;

  constructor() {
    this.TDD_CREATED = new Subject<ITDDCreatedEvent>();
    this.tddCreated$ = this.TDD_CREATED.asObservable();

    this.TDD_DISABLED = new Subject<ITDDDisabledEvent>();
    this.tddDisabled$ = this.TDD_DISABLED.asObservable();

    this.TDD_ENABLED = new Subject<ITDDEnabledEvent>();
    this.tddEnabled$ = this.TDD_ENABLED.asObservable();

    this.TDD_RETRIEVAL = new Subject<ITDDRetrievalEvent>();
    this.tddRetrieval$ = this.TDD_RETRIEVAL.asObservable();
  }

  public async connect() {
    // @ts-ignore
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    // MetaMask requires requesting permission to connect users accounts
    await this.provider.send('eth_requestAccounts', []);
    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    this.signer = this.provider.getSigner();

    // ANOTHER OPTION:
    // this.provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${environment.infuraProjectId}`)
    // this.signer = new ethers.Wallet(privateKey, this.provider); // Can be used as a signer

    // Readonly contract
    this.contract = new ethers.Contract(
      environment.desmoHubAddress,
      desmoHubABI,
      this.provider
    );
    // Read-write contract
    this.contractWithSigner = this.contract.connect(this.signer);

    const ownerAddress = await this.signer.getAddress();

    const filterCreated = this.contract.filters.TDDCreated(ownerAddress);
    this.provider.on(filterCreated, (event: any) => {
      console.log("CREATED", event);
      this.TDD_CREATED.next({ key: event.topics[1], url: event.topics[2] });
    });

    const filterDisabled = this.contract.filters.TDDDisabled(ownerAddress);
    this.provider.on(filterDisabled, (event: any) => {
      console.log("DISABLED", event);
      this.TDD_DISABLED.next({ key: event.topics[1], url: event.topics[2] });
    });

    const filterEnabled = this.contract.filters.TDDEnabled(ownerAddress);
    this.provider.on(filterEnabled, (event: any) => {
      console.log("ENABLED", event);
      this.TDD_ENABLED.next({ key: event.topics[1], url: event.topics[2] });
    });

    const filterRetrieval = this.contract.filters.TDDRetrieval(
      null,
      ownerAddress
    );
    this.provider.on(filterRetrieval, (event: any) => {
      console.log("RETRIEVAL", event);
      this.TDD_RETRIEVAL.next({
        url: event.topics[1],
        owner: event.topics[2],
        disabled:
          event.topics[3] ==
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      });
    });
  }

  private doSomething() {
    // const filterCreated = this.contract.filters.TDDCreated();
    // const eventsCreated = await this.contract.queryFilter(filterCreated, -100000, "latest");
    // console.log(eventsCreated)
    // for(const e of eventsCreated) {
    //     if(e?.args?.key == ownerAddress) {
    //       console.log("CREATED Key found")
    //     }
    // }
    // const filterDisabled = this.contract.filters.TDDDisabled();
    // const eventsDisabled = await this.contract.queryFilter(filterDisabled, -100000, "latest");
    // console.log(eventsDisabled)
    // for(const e of eventsDisabled) {
    //   if(e?.args?.key == ownerAddress) {
    //     console.log("DISABLED Key found")
    //   }
    // }
  }

  public async registerTDD(tddUrl: string): Promise<void> {
    if (this.contractWithSigner) {
      const ownerAddress = await this.signer.getAddress();

      await this.contractWithSigner.registerTDD({
        url: tddUrl,
        owner: ownerAddress,
        disabled: false,
      });
    }
  }

  public async disableTDD(): Promise<void> {
    if (this.contractWithSigner) {
      await this.contractWithSigner.disableTDD();
    }
  }

  public async enableTDD(): Promise<void> {
    if (this.contractWithSigner) {
      await this.contractWithSigner.enableTDD();
    }
  }

  public async getTDD(): Promise<void> {
    if (this.contractWithSigner) {
      await this.contractWithSigner.getTDD();
    }
  }

  ngOnDestroy() {
    this.provider.removeAllListeners();
  }
}
