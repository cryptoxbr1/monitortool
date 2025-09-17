import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { cn } from "@/lib/utils";

export interface TokenHistoryPoint { t: number; uniswap?: number | null; pancakeswap?: number | null }
export interface PairSnapshot { dex: "uniswap" | "pancakeswap"; pairAddress: string; priceUsd: number | null; volume24hUsd: number | null; liquidityUsd: number | null }
export interface TokenRealtime { tokenName: string; tokenAddress: string; pairs: PairSnapshot[]; history: TokenHistoryPoint[] }

function formatUsd(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}k`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function TokenCard({ token }: { token: TokenRealtime }) {
  const uni = token.pairs.find((p) => p.dex === "uniswap");
  const cake = token.pairs.find((p) => p.dex === "pancakeswap");

  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden")}>      
      <div className="p-4 flex items-center justify-between bg-gradient-to-r from-[hsl(var(--brand-600))] to-[hsl(var(--brand-500))] text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/15 ring-1 ring-white/25 flex items-center justify-center font-bold">{token.tokenName[0]}</div>
          <div>
            <div className="text-lg font-semibold leading-tight">{token.tokenName} / WETH</div>
            <div className="text-xs opacity-80">{token.tokenAddress}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-90">Uniswap</div>
          <div className="text-xl font-bold">{formatUsd(uni?.priceUsd ?? null)}</div>
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
          <div className="text-xs text-muted-foreground">PancakeSwap Price</div>
          <div className="text-base font-medium">{formatUsd(cake?.priceUsd ?? null)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Liquidity (Uni)</div>
          <div className="text-base font-medium">{formatUsd(uni?.liquidityUsd ?? null)}</div>
        </div>
      </div>
      <div className="px-2 pb-4">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={token.history.map((d) => ({
              time: formatTime(d.t),
              uniswap: d.uniswap ?? undefined,
              pancakeswap: d.pancakeswap ?? undefined,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="uniswap" stroke="hsl(var(--brand-600))" strokeWidth={2} dot={false} name="Uniswap" />
              <Line type="monotone" dataKey="pancakeswap" stroke="hsl(var(--brand-400))" strokeWidth={2} dot={false} name="PancakeSwap" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
