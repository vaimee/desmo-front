import {
  ITDDCreatedEvent,
  ITDDDisabledEvent,
  ITDDEnabledEvent,
  ITDDRetrievalEvent,
  ITransactionSent,
} from './desmo-hub.types';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { desmoHubABI } from './desmoHubABI';
import { Observable, Subject } from 'rxjs';
import { EthereumDatatypes, getArray, getMappings, getNumberVariable, getStringVariable } from './storage-utils';

@Injectable({
  providedIn: 'root',
})
export class DesmoHubService {
  private provider: ethers.providers.Web3Provider;
  private signer: any;
  private contract: any;
  private contractWithSigner: any;
  private abiInterface: any;

  private TDD_CREATED: Subject<ITDDCreatedEvent>;
  tddCreated$: Observable<ITDDCreatedEvent>;

  private TDD_DISABLED: Subject<ITDDDisabledEvent>;
  tddDisabled$: Observable<ITDDDisabledEvent>;

  private TDD_ENABLED: Subject<ITDDEnabledEvent>;
  tddEnabled$: Observable<ITDDEnabledEvent>;

  private TDD_RETRIEVAL: Subject<ITDDRetrievalEvent>;
  tddRetrieval$: Observable<ITDDRetrievalEvent>;

  private TRANSACTION_SENT: Subject<ITransactionSent>;
  transactionSent$: Observable<ITransactionSent>;

  constructor() {
    this.TDD_CREATED = new Subject<ITDDCreatedEvent>();
    this.tddCreated$ = this.TDD_CREATED.asObservable();

    this.TDD_DISABLED = new Subject<ITDDDisabledEvent>();
    this.tddDisabled$ = this.TDD_DISABLED.asObservable();

    this.TDD_ENABLED = new Subject<ITDDEnabledEvent>();
    this.tddEnabled$ = this.TDD_ENABLED.asObservable();

    this.TDD_RETRIEVAL = new Subject<ITDDRetrievalEvent>();
    this.tddRetrieval$ = this.TDD_RETRIEVAL.asObservable();

    this.TRANSACTION_SENT = new Subject<ITransactionSent>();
    this.transactionSent$ = this.TRANSACTION_SENT.asObservable();

    // @ts-ignore
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
  }

  public async connect() {
    // MetaMask requires requesting permission to connect users accounts
    await this.provider.send('eth_requestAccounts', []);
    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    this.signer = this.provider.getSigner();

    // ANOTHER OPTION:
    // this.provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${environment.infuraProjectId}`)
    // this.signer = new ethers.Wallet(privateKey, this.provider); // Can be used as a signer

    this.abiInterface = new ethers.utils.Interface(desmoHubABI);
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
    this.attachListenerForNewEvents(filterCreated, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);
      console.log('TDDCreated', parsedEvent);
      this.TDD_CREATED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
        disabled: parsedEvent.args.disabled,
      });
    });

    const filterDisabled = this.contract.filters.TDDDisabled(ownerAddress);
    this.attachListenerForNewEvents(filterDisabled, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);
      console.log('TDDDisabled', parsedEvent);
      this.TDD_DISABLED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
      });
    });

    const filterEnabled = this.contract.filters.TDDEnabled(ownerAddress);
    this.attachListenerForNewEvents(filterEnabled, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);
      console.log('TDDEnabled', parsedEvent);
      this.TDD_ENABLED.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
      });
    });

    const filterRetrieval = this.contract.filters.TDDRetrieval(ownerAddress);
    this.attachListenerForNewEvents(filterRetrieval, (event: any) => {
      const parsedEvent = this.abiInterface.parseLog(event);
      console.log('TDDRetrieval', parsedEvent);
      this.TDD_RETRIEVAL.next({
        key: parsedEvent.args.key,
        url: parsedEvent.args.url,
        disabled: parsedEvent.args.disabled,
      });
    });
  }

  private attachListenerForNewEvents(eventFilter: any, listener: any) {
    // The following is a workaround that will stop to be required when ethers.js v6 will be released:
    // (see https://github.com/ethers-io/ethers.js/issues/2310)
    this.provider.once('block', () => {
      this.provider.on(eventFilter, listener);
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

      const tx = await this.contractWithSigner.registerTDD({
        url: tddUrl,
        owner: ownerAddress,
        disabled: false,
      });
      this.TRANSACTION_SENT.next({
        invokedOperation: 'Register TDD',
        hash: tx.hash,
        sent: new Date(Date.now()),
      });
    } else {
      throw new Error('[registerTDD] this operation requires a signer!');
    }
  }

  public async disableTDD(): Promise<void> {
    if (this.contractWithSigner) {
      const tx = await this.contractWithSigner.disableTDD();
      this.TRANSACTION_SENT.next({
        invokedOperation: 'Disable TDD',
        hash: tx.hash,
        sent: new Date(Date.now()),
      });
    } else {
      throw new Error('[disableTDD] this operation requires a signer!');
    }
  }

  public async enableTDD(): Promise<void> {
    if (this.contractWithSigner) {
      const tx = await this.contractWithSigner.enableTDD();
      this.TRANSACTION_SENT.next({
        invokedOperation: 'Enable TDD',
        hash: tx.hash,
        sent: new Date(Date.now()),
      });
    } else {
      throw new Error('[enableTDD] this operation requires a signer!');
    }
  }

  public async getTDD(): Promise<void> {
    if (this.contractWithSigner) {
      const tx = await this.contractWithSigner.getTDD();
      this.TRANSACTION_SENT.next({
        invokedOperation: 'Get TDD',
        hash: tx.hash,
        sent: new Date(Date.now()),
      });
    } else if (this.contract) {
      const tx = await this.contract.getTDD();
      this.TRANSACTION_SENT.next({
        invokedOperation: 'Get TDD',
        hash: tx.hash,
        sent: new Date(Date.now()),
      });
    } else {
      throw new Error('[getTDD] this operation requires a contract!');
    }
  }

  ngOnDestroy() {
    this.provider.removeAllListeners();
  }

  async readStorage(): Promise<void> {
    console.log("SLOT [0]: " + await getNumberVariable(this.provider, environment.desmoHubAddress, 0))
    console.log("SLOT [1]: " + await getNumberVariable(this.provider, environment.desmoHubAddress, 1))
    const keys = await getArray(this.provider, environment.desmoHubAddress, 2, EthereumDatatypes.hex);
    console.log("SLOT [2-3]: " + keys);
    console.log("SLOT [4]: " + await getNumberVariable(this.provider, environment.desmoHubAddress, 4))

    // "0x3252bcaea03d7bc3afe95a76c845c08b3121b6e7b90a3ba513c1a664d3ee1b1a"
    // "0x1800fc8613ff3ff65bd8b78631d899e9ca07ae14b1caad56a26479f3f419488b"

    const bibba = await getNumberVariable(this.provider, environment.desmoHubAddress, "0x3252bcaea03d7bc3afe95a76c845c08b3121b6e7b90a3ba513c1a664d3ee1b1b")
    console.log("String is: " + bibba);
    console.log(await getMappings(this.provider, environment.desmoHubAddress, 4, [EthereumDatatypes.string, EthereumDatatypes.hex, EthereumDatatypes.boolean], keys));
  }
}
