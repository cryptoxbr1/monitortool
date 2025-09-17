import type { TokenSnapshot, PairSnapshot } from "@/types/tokens";
import { ARBITRUM_TOKENS } from "@/config/tokens";

async function fetchPair(pairAddress: string): Promise<Omit<PairSnapshot, "dex"> & { base?: string; quote?: string }> {
  const direct = `https://api.dexscreener.com/latest/dex/pairs/arbitrum/${pairAddress}`;
  const proxy = `/api/dexscreener/latest/dex/pairs/arbitrum/${pairAddress}`;
  // Try direct first
  try {
    const r = await fetch(direct, { headers: { accept: "application/json" } });
    if (r.ok) {
      const j = await r.json();
      const p = j?.pairs?.[0];
      return {
        pairAddress,
        priceUsd: p?.priceUsd ? Number(p.priceUsd) : null,
        volume24hUsd: p?.volume?.h24 != null ? Number(p.volume.h24) : null,
        liquidityUsd: p?.liquidity?.usd != null ? Number(p.liquidity.usd) : null,
        base: p?.baseToken?.symbol,
        quote: p?.quoteToken?.symbol,
      };
    }
  } catch {}
  // Fallback to proxy
  const res = await fetch(proxy, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`dexscreener-proxy ${res.status}`);
  const json = await res.json();
  const p = json?.pairs?.[0];
  return {
    pairAddress,
    priceUsd: p?.priceUsd ? Number(p.priceUsd) : null,
    volume24hUsd: p?.volume?.h24 != null ? Number(p.volume.h24) : null,
    liquidityUsd: p?.liquidity?.usd != null ? Number(p.liquidity.usd) : null,
    base: p?.baseToken?.symbol,
    quote: p?.quoteToken?.symbol,
  };
}

export interface PollState {
  index: number; // rotating index over pairs
  lastErrorAt?: number;
}

export const TOKENS = ARBITRUM_TOKENS.map((t) => ({
  tokenName: t.name,
  tokenAddress: t.tokenAddress,
  pairs: t.pairs,
}));

const ALL_PAIRS = ARBITRUM_TOKENS.flatMap((t) => t.pairs.map((p) => ({ tokenName: t.name, tokenAddress: t.tokenAddress, ...p })));

export async function pollChunk(state: PollState, chunkSize = 8): Promise<{ data: TokenSnapshot[]; next: PollState; updatedAt: number }> {
  const now = Date.now();
  const start = state.index % ALL_PAIRS.length;
  const slice = [] as typeof ALL_PAIRS;
  for (let i = 0; i < Math.min(chunkSize, ALL_PAIRS.length); i++) {
    slice.push(ALL_PAIRS[(start + i) % ALL_PAIRS.length]);
  }

  const results = await Promise.allSettled(
    slice.map(async (it) => {
      const r = await fetchPair(it.pairAddress);
      const pair: PairSnapshot = {
        dex: it.dex,
        pairAddress: it.pairAddress,
        priceUsd: r.priceUsd,
        volume24hUsd: r.volume24hUsd,
        liquidityUsd: r.liquidityUsd,
      };
      return { tokenName: it.tokenName, tokenAddress: it.tokenAddress, pair };
    }),
  );

  const map = new Map<string, TokenSnapshot>();
  for (const t of TOKENS) {
    map.set(t.tokenName, { tokenName: t.tokenName, tokenAddress: t.tokenAddress, pairs: [] });
  }

  for (const r of results) {
    if (r.status === "fulfilled") {
      const { tokenName, tokenAddress, pair } = r.value;
      const cur = map.get(tokenName)!;
      cur.tokenAddress = tokenAddress;
      cur.pairs.push(pair);
    }
  }

  return { data: Array.from(map.values()), next: { index: (start + slice.length) % ALL_PAIRS.length }, updatedAt: now };
}
