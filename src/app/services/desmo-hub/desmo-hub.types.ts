export interface ITDDCreatedEvent {
    key: string;
    url: string;
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
    url: string;
    owner: string;
    disabled: boolean;
  }