export const desmoHubABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'key',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'url',
        type: 'string',
      },
    ],
    name: 'TDDCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'key',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'url',
        type: 'string',
      },
    ],
    name: 'TDDDisabled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'key',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'url',
        type: 'string',
      },
    ],
    name: 'TDDEnabled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'url',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bool',
        name: 'disabled',
        type: 'bool',
      },
    ],
    name: 'TDDRetrieval',
    type: 'event',
  },
  {
    inputs: [],
    name: 'disableTDD',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'enableTDD',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getNewRequestID',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTDD',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'disabled',
            type: 'bool',
          },
        ],
        internalType: 'struct DesmoLDHub.TDD',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'key',
        type: 'uint256',
      },
    ],
    name: 'getTDDByRequestID',
    outputs: [
      {
        internalType: 'string[]',
        name: '',
        type: 'string[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'url',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'disabled',
            type: 'bool',
          },
        ],
        internalType: 'struct DesmoLDHub.TDD',
        name: 'tdd',
        type: 'tuple',
      },
    ],
    name: 'registerTDD',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'viewSelected',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
];
