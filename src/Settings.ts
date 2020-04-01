
export const VOLTA_CHAIN_ID = 73799;
export const EWC_CHAIN_ID = 246;

export const NETWORKS = {
  [VOLTA_CHAIN_ID.toString()]: {
      name: 'Volta',
      type: 'testnet',
	  address_registry: '0xd7CeF70Ba7efc2035256d828d5287e2D285CD1ac',
	  address_registrar_base: '0x5630EBDbf41624fF77DcBfC4518c867D93E42E9f',
	  address_registrar_controller: '0xb842CCA1682DC2Ee6A9da6A59bA4B5C736b229cD'
  },
  [EWC_CHAIN_ID.toString()]: {
      name: 'Energy Web Chain',
      type: 'production chain',
	  address_registry: '0x0A6d64413c07E10E890220BBE1c49170080C6Ca0',
	  address_registrar_base: '0x3BDA3EE55a5b43493BA05468d0AE5A5fF916252f',
	  address_registrar_controller: '0x9C99a28D3d702E6096361Ff31E724b772B5D709e'
  }
};

export interface StringToNum {
  [key: string]: number
};

export interface StringToString {
  [key: string]: string
};

export const coinMap: StringToNum = {
  'Bitcoin': 0,	
  'Litecoi': 2,	
  'Dogecoin': 3,	
  'Monacoin': 22,	
  'Ethereum': 60,
  'Ethereum Classic': 61,
  'Rootstock': 137,
  'Ripple': 144,
  'Bitcoin Cash': 145,
  'Binance': 714
};

export const textKeys = ['email', 'url', 'avatar', 'description', 'notice', 'keywords', 'vnd.twitter', 'vnd.github', 'contract'];

export const abiMap: StringToNum = {
	'JSON': 1,
	'Zlib-compressed JSON': 2,
	'CBOR': 4,
	'URI': 8
};

export const codecToProtocol: StringToString = {
	'ipfs-ns': 'ipfs',
	'swarm-ns': 'bzz',
	'onion': 'onion',
	'onion3': 'onion3'
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZERO_BYTES = "0x0000000000000000000000000000000000000000000000000000000000000000";
