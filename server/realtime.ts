import type { Server as IOServer, Socket } from "socket.io";
import { fetchAllTokenSnapshots, type TokenSnapshot } from "./utils/dex";

export interface TokenHistoryPoint {
  t: number; // epoch ms
  uniswap?: number | null;
  pancakeswap?: number | null;
}

export interface TokenRealtime extends TokenSnapshot {
  history: TokenHistoryPoint[];
}

const MAX_HISTORY_POINTS = 180; // keep ~30 minutes at 10s interval

let latest: TokenRealtime[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

export function getCurrentSnapshot(): TokenRealtime[] {
  return latest;
}

function mergeSnapshotsIntoHistory(prev: TokenRealtime[], next: TokenSnapshot[]): TokenRealtime[] {
  const map = new Map<string, TokenRealtime>();
  for (const p of prev) map.set(p.tokenName, p);
  const now = Date.now();

  return next.map((snap) => {
    const prevEntry = map.get(snap.tokenName);
    const priceUniswap = snap.pairs.find((p) => p.dex === "uniswap")?.priceUsd ?? null;
    const pricePancake = snap.pairs.find((p) => p.dex === "pancakeswap")?.priceUsd ?? null;

    const point: TokenHistoryPoint = { t: now, uniswap: priceUniswap, pancakeswap: pricePancake };

    const history = prevEntry ? [...prevEntry.history, point].slice(-MAX_HISTORY_POINTS) : [point];

    return { ...snap, history } as TokenRealtime;
  });
}

export async function pollOnce(): Promise<TokenRealtime[]> {
  const next = await fetchAllTokenSnapshots();
  latest = mergeSnapshotsIntoHistory(latest, next);
  return latest;
}

export function attachSocketServer(io: IOServer) {
  // start polling if not already
  if (!timer) {
    // initial
    pollOnce().catch(() => {});
    timer = setInterval(() => {
      pollOnce()
        .then((data) => {
          io.emit("tokenUpdate", data);
        })
        .catch(() => {
          // ignore failures, next tick will retry
        });
    }, 10000);
  }

  io.on("connection", (socket: Socket) => {
    socket.emit("tokenUpdate", latest);
  });
}
