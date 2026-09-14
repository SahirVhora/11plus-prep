import { timingSafeEqual } from "node:crypto";
import {
  AiServiceError,
  normaliseGenerateRequest,
  requestModelText,
  validateGeneratedQuestions,
} from "./ai-core.ts";
import type { ApiRequest, ApiResponse } from "./http-types.ts";

const DEFAULT_ORIGINS = [
  "https://sahirvhora.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function allowCors(req: ApiRequest, res: ApiResponse): boolean {
  const configured = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_ORIGINS, ...configured]);
  const origin =
    typeof req.headers.origin === "string" ? req.headers.origin : "";

  if (origin && allowed.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Worksheet-Access",
  );
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  if (origin && !allowed.has(origin)) {
    res
      .status(403)
      .json({ error: "Origin is not allowed.", code: "ORIGIN_DENIED" });
    return true;
  }
  return false;
}

function hasFamilyAccess(req: ApiRequest): boolean {
  const expected = process.env.WORKSHEET_ACCESS_CODE;
  if (!expected) {
    throw new AiServiceError(
      503,
      "ACCESS_NOT_CONFIGURED",
      "The family AI service is not fully configured yet.",
    );
  }
  const receivedHeader = req.headers["x-worksheet-access"];
  const received = Array.isArray(receivedHeader)
    ? receivedHeader[0]
    : receivedHeader;
  if (!received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (allowCors(req, res)) return;
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });

  try {
    if (!hasFamilyAccess(req)) {
      throw new AiServiceError(
        401,
        "ACCESS_DENIED",
        "Enter the family AI access code to create a worksheet.",
      );
    }
    const request = normaliseGenerateRequest(req.body);
    const rawText = await requestModelText(request, process.env);
    const questions = validateGeneratedQuestions(rawText, request);
    return res
      .status(200)
      .json({ questions, provider: request.provider, model: request.model });
  } catch (error: unknown) {
    if (error instanceof AiServiceError) {
      console.warn("AI worksheet request failed", {
        code: error.code,
        status: error.status,
      });
      return res
        .status(error.status)
        .json({ error: error.message, code: error.code });
    }
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    console.error("AI worksheet request failed", {
      code: timedOut ? "TIMEOUT" : "UNEXPECTED_ERROR",
    });
    return res.status(timedOut ? 504 : 500).json({
      error: timedOut
        ? "The AI provider took too long. Try another model or Free Practice."
        : "The worksheet could not be generated. Try another model or Free Practice.",
      code: timedOut ? "TIMEOUT" : "UNEXPECTED_ERROR",
    });
  }
}
