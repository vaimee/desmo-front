import { Bytes } from 'ethers';
import IQuery, { defaultIQuery } from './IQuery';

export enum QueryResultTypes {
  POS_INTEGER = 0,
  POS_FLOAT = 1,
  NEG_INTEGER = 2,
  NEG_FLOAT = 3,
  STRING = 4,
  BOOLEAN = 5,
  FUTURE_USE_2 = 6,
  FUTURE_USE_3 = 7,
}

export interface IResult {
  loading: boolean;
  error: boolean;
  errorMessage: string;
  arrived: boolean;
  data: IResultData;
  elapsedTime: number;
  query: IQuery;
  requestId: Bytes;
}

interface IResultData {
  value: number | string;
  type: QueryResultTypes;
}

export function defaultIResult(): IResult {
  return {
    loading: false,
    error: false,
    errorMessage: '',
    arrived: false,
    data: {
      value: 0,
      type: QueryResultTypes.POS_INTEGER,
    },
    elapsedTime: 0,
    query: defaultIQuery(),
    requestId: [0],
  };
}

export interface IResultTable {
  property: string;
  value: number | string;
  unit: string;
  time: number;
}

export function defaultIResultTable(): IResultTable[] {
  return [];
}
