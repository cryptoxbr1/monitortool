import { useEffect, useMemo, useState } from "react";
import type { TokenRealtime } from "@/components/TokenCard";
import TokenList from "@/components/TokenList";
import ThemeToggle from "@/components/ThemeToggle";
import { io, Socket } from "socket.io-client";

export default function Index() {
  const [data, setData] = useState<TokenRealtime[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let s: Socket | null = null;
    const base = `${window.location.protocol}//${window.location.host}`;

    fetch(`/api/tokenData`).then(async (r) => {
      if (r.ok) {
        const d = (await r.json()) as TokenRealtime[];
        setData(d);
      }
    });

    s = io(base, { path: "/socket.io", transports: ["websocket", "polling"] });
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("tokenUpdate", (payload: TokenRealtime[]) => {
      setData(payload);
    });

    return () => {
      s?.close();
    };
  }, []);

  const lastUpdated = useMemo(() => {
    const all = data.flatMap((t) => t.history.map((h) => h.t));
    return all.length ? new Date(Math.max(...all)) : null;
  }, [data]);

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
              <span
                className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
              />
              {connected ? "Live" : "Offline"}
              {lastUpdated && (
                <span className="ml-2">
                  • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
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
