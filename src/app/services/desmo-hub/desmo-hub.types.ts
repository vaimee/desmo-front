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
