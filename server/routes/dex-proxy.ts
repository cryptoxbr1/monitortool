import type { RequestHandler } from "express";

interface CacheEntry {
  body: any;
  expires: number;
}
const cache = new Map<string, CacheEntry>();
const TTL_MS = 8000; // simple short cache to reduce API pressure

export const proxyDexPair: RequestHandler = async (req, res) => {
  try {
    const pair = req.params.pair;
    if (!pair) return res.status(400).json({ error: "pair required" });
    const key = `pair:${pair}`;
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && hit.expires > now) {
      res.setHeader("x-cache", "HIT");
      return res.json(hit.body);
    }

    const url = `https://api.dexscreener.com/latest/dex/pairs/arbitrum/${pair}`;
    const upstream = await fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: `upstream ${upstream.status}` });
    }
    const json = await upstream.json();
    cache.set(key, { body: json, expires: now + TTL_MS });
    res.setHeader("x-cache", "MISS");
    res.json(json);
  } catch (e: any) {
    res.status(500).json({ error: "proxy error" });
  }
};
