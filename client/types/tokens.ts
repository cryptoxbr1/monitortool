export type DexId = "uniswap" | "pancakeswap";

export interface PairSnapshot {
  dex: DexId;
  pairAddress: string;
  priceUsd: number | null;
  volume24hUsd: number | null;
  liquidityUsd: number | null;
}

export interface TokenSnapshot {
  tokenName: string;
  tokenAddress: string;
  pairs: PairSnapshot[];
}
