import type { RequestHandler } from "express";

export type DexId = "uniswap" | "pancakeswap";

export interface TokenSpec {
  name: string;
  tokenAddress: string;
  pairs: {
    dex: DexId;
    pairAddress: string; // Pair (pool) address on Arbitrum for WETH pair
  }[];
}

export interface PairSnapshot {
  dex: DexId;
  pairAddress: string;
  priceUsd: number | null;
  volume24hUsd: number | null;
  liquidityUsd: number | null;
  baseTokenSymbol?: string;
  quoteTokenSymbol?: string;
  url?: string;
}

export interface TokenSnapshot {
  tokenName: string;
  tokenAddress: string;
  pairs: PairSnapshot[];
}

// Tokens provided by the user, paired with WETH on Arbitrum
export const ARBITRUM_TOKENS: TokenSpec[] = [
  {
    name: "LINK",
    tokenAddress: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0x468b88941e7Cc0B88c1869d68ab6b570bCEF62Ff",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0x977f5D9a39049c73bc26eDb3FA15d5f7C0Ac82E9",
      },
    ],
  },
  {
    name: "ARB",
    tokenAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0xC6F780497A95e246EB9449f5e4770916DCd6396A",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0x11d53EC50bc8F54B9357fbFe2A7dE034FC00f8b3",
      },
    ],
  },
  {
    name: "AAVE",
    tokenAddress: "0xba5ddd1f9d7f570dc94a51479a000e3bce967196",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0x263f7B865DE80355F91C00dFb975A821Effbea24",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0x80Ceb98632409080924DCE50C26aCC25458DDe17",
      },
    ],
  },
  {
    name: "UNI",
    tokenAddress: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0xC24f7d8E51A64dc1238880BD00bb961D54cbeb29",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0xaD198aD5f32cBa24bcafA6E9FfECe312C2dDCD6F",
      },
    ],
  },
  {
    name: "PENDLE",
    tokenAddress: "0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0xB08a8794A5D3cCCA3725D92964696858d3201909",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0x042691F78269BA3d6325c945044239758aecC275",
      },
    ],
  },
  {
    name: "ETHFI",
    tokenAddress: "0x7189fb5B6504bbfF6a852B13B7B82a3c118fDc27",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0x7e9cb8aD4a7683070E233F3Eb1D07d87272b9b26",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0x143605C4D4f9f18EeDaFeB75D6e2Cca7AaCB4bbc",
      },
    ],
  },
  {
    name: "ZRO",
    tokenAddress: "0x6985884c4392d348587b19cb9eaaf157f13271cd",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0x4CEf551255EC96d89feC975446301b5C4e164C59",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0xf0346b437Fe43e64Fa799C2BD3cf5Db1F7e9327C",
      },
    ],
  },
  {
    name: "CRV",
    tokenAddress: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0xa95b0F5a65a769d82AB4F3e82842E45B8bbAf101",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0xdD8D6624A601AB4F0C898DfD04AabfBeaA0FF317",
      },
    ],
  },
  {
    name: "GMX",
    tokenAddress: "0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0x1aEEdD3727A6431b8F070C0aFaA81Cc74f273882",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0x39230D814D605663E3f469DCBE739FB005DB9331",
      },
    ],
  },
  {
    name: "ATH",
    tokenAddress: "0xc87b37a581ec3257b734886d9d3a581f5a9d056c",
    pairs: [
      {
        dex: "uniswap",
        pairAddress: "0x5cbddc44F31067dF328aA7a8Da03aCa6F2EdD2aD",
      },
      {
        dex: "pancakeswap",
        pairAddress: "0x3fA9fFD64021b02C64620039c2db9D76C9b0aBB5",
      },
    ],
  },
];

export async function fetchPairSnapshot(
  pairAddress: string,
): Promise<PairSnapshot> {
  try {
    const url = `https://api.dexscreener.com/latest/dex/pairs/arbitrum/${pairAddress}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`DEX Screener error ${res.status}`);
    const json = await res.json();
    const p = json?.pairs?.[0];
    const priceUsd = p?.priceUsd ? Number(p.priceUsd) : null;
    const volume24hUsd = p?.volume?.h24 != null ? Number(p.volume.h24) : null;
    const liquidityUsd =
      p?.liquidity?.usd != null ? Number(p.liquidity.usd) : null;
    return {
      dex: "uniswap", // placeholder, fixed below by caller
      pairAddress,
      priceUsd,
      volume24hUsd,
      liquidityUsd,
      baseTokenSymbol: p?.baseToken?.symbol,
      quoteTokenSymbol: p?.quoteToken?.symbol,
      url: p?.url,
    };
  } catch (e) {
    return {
      dex: "uniswap",
      pairAddress,
      priceUsd: null,
      volume24hUsd: null,
      liquidityUsd: null,
    };
  }
}

export async function fetchAllTokenSnapshots(): Promise<TokenSnapshot[]> {
  const results: TokenSnapshot[] = [];
  for (const token of ARBITRUM_TOKENS) {
    const pairPromises = token.pairs.map(async (p) => {
      const snap = await fetchPairSnapshot(p.pairAddress);
      return { ...snap, dex: p.dex } as PairSnapshot;
    });
    const pairs = await Promise.all(pairPromises);
    results.push({
      tokenName: token.name,
      tokenAddress: token.tokenAddress,
      pairs,
    });
  }
  return results;
}
