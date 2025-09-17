import { useEffect, useMemo, useRef, useState } from "react";
import type { TokenSnapshot } from "@/types/tokens";
import TokenList from "@/components/TokenList";
import ThemeToggle from "@/components/ThemeToggle";
import { pollChunk, type PollState, TOKENS } from "@/lib/dexClient";

export default function Index() {
  const [data, setData] = useState<TokenSnapshot[]>([]);
  const [live, setLive] = useState(false);
  const updatedAtRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let state: PollState = { index: 0 };
    let interval = 10000;

    const run = async () => {
      try {
        const { data: batch, next, updatedAt } = await pollChunk(state, 4);
        state = next;
        updatedAtRef.current = updatedAt;
        setLive(true);
        // merge partial batch into existing data
        setData((prev) => {
          const map = new Map<string, TokenSnapshot>();
          // seed with previous
          for (const t of prev) map.set(t.tokenName, { ...t, pairs: [...t.pairs] });
          // ensure all tokens exist
          for (const t of TOKENS) if (!map.has(t.tokenName)) map.set(t.tokenName, { tokenName: t.tokenName, tokenAddress: t.tokenAddress, pairs: [] });
          // upsert pairs from batch
          for (const t of batch) {
            const cur = map.get(t.tokenName)!;
            for (const p of t.pairs) {
              const idx = cur.pairs.findIndex((x) => x.dex === p.dex);
              if (idx >= 0) cur.pairs[idx] = p; else cur.pairs.push(p);
            }
          }
          return Array.from(map.values());
        });
      } catch (e) {
        setLive(false);
        interval = Math.min(interval * 2, 60000); // backoff to 60s max
      }
      if (!cancelled) setTimeout(run, interval);
    };

    run();
    return () => { cancelled = true; };
  }, []);

  const lastUpdated = useMemo(() => (updatedAtRef.current ? new Date(updatedAtRef.current) : null), [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[hsl(var(--brand-600))] text-white grid place-items-center font-bold">
              A
            </div>
            <div>
              <div className="font-semibold leading-tight">
                Arbitrum Token Monitor
              </div>
              <div className="text-xs text-muted-foreground">
                WETH pairs on Uniswap & PancakeSwap
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${live ? "bg-green-500" : "bg-red-500"}`} />
              {live ? "Live" : "Offline"}
              {lastUpdated && <span className="ml-2">• Updated {lastUpdated.toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <TokenList data={data} />
        {data.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-6">
            Loading real-time token data…
          </div>
        )}
      </main>
    </div>
  );
}
