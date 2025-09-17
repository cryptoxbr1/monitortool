import { cn } from "@/lib/utils";

export interface TokenHistoryPoint { t: number; uniswap?: number | null; pancakeswap?: number | null }
export interface PairSnapshot { dex: "uniswap" | "pancakeswap"; pairAddress: string; priceUsd: number | null; volume24hUsd: number | null; liquidityUsd: number | null }
export interface TokenRealtime { tokenName: string; tokenAddress: string; pairs: PairSnapshot[]; history: TokenHistoryPoint[] }

function formatUsd(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(2)}k`;
  const digits = abs >= 1 ? 2 : 6;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: digits })}`;
}

export default function TokenCard({ token }: { token: TokenRealtime }) {
  const uni = token.pairs.find((p) => p.dex === "uniswap");
  const cake = token.pairs.find((p) => p.dex === "pancakeswap");
  const uniPrice = uni?.priceUsd ?? null;
  const cakePrice = cake?.priceUsd ?? null;

  const uniHigher = uniPrice != null && cakePrice != null && uniPrice > cakePrice;
  const cakeHigher = uniPrice != null && cakePrice != null && cakePrice > uniPrice;

  const uniPriceClass = uniHigher ? "text-emerald-600" : cakeHigher ? "text-rose-600" : "text-foreground";
  const cakePriceClass = cakeHigher ? "text-emerald-600" : uniHigher ? "text-rose-600" : "text-foreground";

  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden")}>
      <div className="p-4 flex items-center justify-between bg-gradient-to-r from-[hsl(var(--brand-600))] to-[hsl(var(--brand-500))] text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/15 ring-1 ring-white/25 flex items-center justify-center font-bold">{token.tokenName[0]}</div>
          <div>
            <div className="text-lg font-semibold leading-tight">{token.tokenName} / WETH</div>
            <div className="text-xs opacity-80 truncate max-w-[220px]">{token.tokenAddress}</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <div className="text-xs opacity-90">Uniswap Price</div>
            <div className={cn("text-xl font-bold", uniPriceClass)}>{formatUsd(uniPrice)}</div>
          </div>
          <div>
            <div className="text-xs opacity-90">PancakeSwap Price</div>
            <div className={cn("text-xl font-bold", cakePriceClass)}>{formatUsd(cakePrice)}</div>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Uniswap 24h Volume</div>
          <div className="text-base font-medium">{formatUsd(uni?.volume24hUsd ?? null)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">PancakeSwap 24h Volume</div>
          <div className="text-base font-medium">{formatUsd(cake?.volume24hUsd ?? null)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Uniswap Liquidity</div>
          <div className="text-base font-medium">{formatUsd(uni?.liquidityUsd ?? null)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">PancakeSwap Liquidity</div>
          <div className="text-base font-medium">{formatUsd(cake?.liquidityUsd ?? null)}</div>
        </div>
      </div>
    </div>
  );
}
