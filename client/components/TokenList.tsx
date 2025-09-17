import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/format";
import type { TokenRealtime } from "@/components/TokenCard";

export default function TokenList({ data }: { data: TokenRealtime[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Token</th>
            <th className="px-3 py-2 text-right font-medium">Uniswap Price</th>
            <th className="px-3 py-2 text-right font-medium">PancakeSwap Price</th>
            <th className="px-3 py-2 text-right font-medium">Uni 24h Vol</th>
            <th className="px-3 py-2 text-right font-medium">Cake 24h Vol</th>
            <th className="px-3 py-2 text-right font-medium">Uni Liquidity</th>
            <th className="px-3 py-2 text-right font-medium">Cake Liquidity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => {
            const uni = t.pairs.find((p) => p.dex === "uniswap");
            const cake = t.pairs.find((p) => p.dex === "pancakeswap");
            const uniPrice = uni?.priceUsd ?? null;
            const cakePrice = cake?.priceUsd ?? null;
            const uniHigher = uniPrice != null && cakePrice != null && uniPrice > cakePrice;
            const cakeHigher = uniPrice != null && cakePrice != null && cakePrice > uniPrice;

            return (
              <tr key={t.tokenName} className="border-t">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-md bg-[hsl(var(--brand-600))]/10 text-[hsl(var(--brand-600))] grid place-items-center text-xs font-bold">{t.tokenName[0]}</div>
                    <div>
                      <div className="font-medium">{t.tokenName} / WETH</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[240px]">{t.tokenAddress}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className={cn("font-semibold", uniHigher ? "text-emerald-600" : cakeHigher ? "text-rose-600" : "text-foreground")}>{formatUsd(uniPrice)}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className={cn("font-semibold", cakeHigher ? "text-emerald-600" : uniHigher ? "text-rose-600" : "text-foreground")}>{formatUsd(cakePrice)}</span>
                </td>
                <td className="px-3 py-2 text-right">{formatUsd(uni?.volume24hUsd ?? null)}</td>
                <td className="px-3 py-2 text-right">{formatUsd(cake?.volume24hUsd ?? null)}</td>
                <td className="px-3 py-2 text-right">{formatUsd(uni?.liquidityUsd ?? null)}</td>
                <td className="px-3 py-2 text-right">{formatUsd(cake?.liquidityUsd ?? null)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
