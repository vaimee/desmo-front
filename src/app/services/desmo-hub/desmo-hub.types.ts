export interface ITDDCreatedEvent {
  key: string;
  url: string;
  disabled: boolean;
}

export interface ITDDDisabledEvent {
  key: string;
  url: string;
}

export interface ITDDEnabledEvent {
  key: string;
  url: string;
}

export interface ITDDRetrievalEvent {
  key: string;
  url: string;
  disabled: boolean;
}

export interface ITransactionSent {
  invokedOperation: 'Register TDD' | 'Disable TDD' | 'Enable TDD' | 'Get TDD';
  hash: string;
  sent: Date;
  confirmed?: Date;
}
