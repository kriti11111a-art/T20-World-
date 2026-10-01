// Web3 Configuration for BSC Mainnet
export const BSC_CHAIN_ID = 56;
export const BSC_CHAIN_ID_HEX = '0x38';

// BSC Mainnet Configuration
export const BSC_NETWORK = {
  chainId: BSC_CHAIN_ID_HEX,
  chainName: 'BNB Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org:443'],
  blockExplorerUrls: ['https://bsctrace.com'],
};

// USDT BEP-20 Contract Address on BSC Mainnet
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// Platform Wallet Addresses
export const PLATFORM_DEPOSIT_WALLET = '0xb1434f2970470ac526599587BBE76A09b0c00bca';
export const PLATFORM_WITHDRAWAL_WALLET = '0x2DFB2b94f4A3aE2687E967C047A9AEff55CEe6a6';

// USDT BEP-20 ABI (minimal for transfer and balance)
export const USDT_ABI = [
  // Read functions
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  // Write functions
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
];
