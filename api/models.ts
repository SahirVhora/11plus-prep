import { AI_PROVIDERS } from "../src/api/aiCatalog.ts";
import { configuredProviders } from "./ai-core.ts";
import type { ApiRequest, ApiResponse } from "./http-types.ts";

export default function handler(req: ApiRequest, res: ApiResponse) {
  const origin =
    typeof req.headers.origin === "string" ? req.headers.origin : "";
  const allowedOrigins = new Set([
    "https://sahirvhora.github.io",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...(process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ]);

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader(
    "Cache-Control",
    "public, max-age=60, stale-while-revalidate=300",
  );
  if (origin && !allowedOrigins.has(origin))
    return res.status(403).json({ error: "Origin is not allowed." });
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const enabled = new Set(configuredProviders(process.env));
  return res.status(200).json({
    accessRequired: true,
    providers: AI_PROVIDERS.map((provider) => ({
      id: provider.id,
      available: enabled.has(provider.id),
    })),
  });
}
