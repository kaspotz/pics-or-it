export const ARB_RPC =
  'https://arbitrum-mainnet.infura.io/v3/91b50d6f88e74281bc3240160cf1b3eb';

export const ARB_DEV_RPC =
  'https://arbitrum-goerli.infura.io/v3/91b50d6f88e74281bc3240160cf1b3eb';

export const CONTRACT_ADDRESS = '0xc0ffee254729296a45a3885639AC7E10F9d54979';
export const CONTRACT_DEV_ADDRESS =
  '0x637d08FcF9A29483bd9571482cC2461D399A5522';

export const PROVIDER_URL =
  process.env.NODE_ENV === 'development' ? ARB_DEV_RPC : ARB_RPC;
export const CONTRACT =
  process.env.NODE_ENV === 'development'
    ? CONTRACT_DEV_ADDRESS
    : CONTRACT_DEV_ADDRESS;
