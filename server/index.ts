import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getCurrentSnapshot, pollOnce } from "./realtime";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Token snapshots (single fetch + in-memory history)
  app.get("/api/tokenData", async (_req, res) => {
    try {
      const snapshot = getCurrentSnapshot();
      if (!snapshot || snapshot.length === 0) {
        const data = await pollOnce();
        return res.json(data);
      }
      return res.json(snapshot);
    } catch (e) {
      return res.status(500).json({ error: "Failed to load token data" });
    }
  });

  return app;
}
