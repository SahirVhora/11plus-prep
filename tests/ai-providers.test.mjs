import assert from "node:assert/strict";
import test from "node:test";

import {
  AiServiceError,
  configuredProviders,
  normaliseGenerateRequest,
  requestModelText,
  validateGeneratedQuestions,
} from "../api/ai-core.ts";
import { AI_PROVIDERS, isAllowedAiModel } from "../src/api/aiCatalog.ts";
import generateHandler from "../api/generate-questions.ts";

const request = normaliseGenerateRequest({
  provider: "openai",
  model: "gpt-5.6-luna",
  subject: "maths",
  difficulty: 2,
  count: 1,
  topics: ["fractions"],
  regionContext: "UK 11+",
});

test("catalogue has unique providers, safe defaults and free choices", () => {
  assert.deepEqual(
    AI_PROVIDERS.map((provider) => provider.id),
    ["openai", "anthropic", "deepseek", "gemini", "openrouter", "groq"],
  );
  assert.equal(
    new Set(AI_PROVIDERS.map((provider) => provider.id)).size,
    AI_PROVIDERS.length,
  );
  assert.ok(
    AI_PROVIDERS.flatMap((provider) => provider.models).some(
      (model) => model.tier === "free",
    ),
  );
  for (const provider of AI_PROVIDERS) {
    assert.ok(provider.models.length > 0);
    for (const model of provider.models)
      assert.equal(isAllowedAiModel(provider.id, model.id), true);
  }
});

test("request validation rejects unknown models and excessive paid work", () => {
  assert.throws(
    () => normaliseGenerateRequest({ ...request, model: "invented-model" }),
    (error) =>
      error instanceof AiServiceError && error.code === "UNSUPPORTED_MODEL",
  );
  assert.throws(
    () => normaliseGenerateRequest({ ...request, count: 31 }),
    (error) =>
      error instanceof AiServiceError && error.code === "INVALID_COUNT",
  );
  assert.equal(
    "apiKey" in
      normaliseGenerateRequest({ ...request, apiKey: "must-not-pass-through" }),
    false,
  );
});

test("generated questions are normalised and fail closed on malformed output", () => {
  const questions = validateGeneratedQuestions(
    JSON.stringify({
      questions: [
        {
          subject: "maths",
          topic: "fractions",
          difficulty: 3,
          type: "mcq",
          question: "Which fraction equals one half?",
          options: ["A) 1/3", "B) 2/4", "C) 3/4", "D) 4/5"],
          answer: "B",
          explanation: "Two of four equal parts is one half.",
        },
      ],
    }),
    request,
  );
  assert.equal(questions[0].id, "ai-openai-maths-1");
  assert.equal(
    questions[0].difficulty,
    2,
    "server-owned request settings override model drift",
  );
  assert.throws(
    () => validateGeneratedQuestions('{"questions":[]}', request),
    (error) =>
      error instanceof AiServiceError && error.code === "INVALID_RESPONSE",
  );
  assert.throws(
    () =>
      validateGeneratedQuestions(
        JSON.stringify({
          questions: [
            {
              subject: "maths",
              topic: "fractions",
              question: "Which fraction equals one half?",
              options: ["1/3", "2/4", "3/4", "4/5"],
              answer: "B",
              explanation: "Two of four equal parts is one half.",
            },
          ],
        }),
        request,
      ),
    (error) =>
      error instanceof AiServiceError && error.code === "INVALID_RESPONSE",
  );
});

test("mixed-paper validation requires a real subject on every question", () => {
  const mixed = normaliseGenerateRequest({ ...request, subject: "mixed" });
  const valid = JSON.stringify({
    questions: [
      {
        subject: "english",
        topic: "vocabulary",
        question: "Choose the closest meaning to rapid.",
        options: ["A) slow", "B) quiet", "C) fast", "D) heavy"],
        answer: "C",
        explanation: "Rapid means fast.",
      },
    ],
  });
  assert.equal(validateGeneratedQuestions(valid, mixed)[0].subject, "english");
  assert.throws(
    () => validateGeneratedQuestions(valid.replace("english", "mixed"), mixed),
    AiServiceError,
  );
});

test("provider routing uses server keys and returns safe quota errors", async () => {
  let authorization = "";
  const successFetch = async (_url, init) => {
    authorization = init.headers.Authorization;
    return new Response(JSON.stringify({ output_text: '{"questions":[]}' }), {
      status: 200,
    });
  };
  assert.equal(
    await requestModelText(
      request,
      { OPENAI_API_KEY: "server-secret" },
      successFetch,
    ),
    '{"questions":[]}',
  );
  assert.equal(authorization, "Bearer server-secret");
  assert.deepEqual(
    configuredProviders({ OPENAI_API_KEY: "x", GROQ_API_KEY: "y" }),
    ["openai", "groq"],
  );

  const limitedFetch = async () => new Response("quota", { status: 429 });
  await assert.rejects(
    requestModelText(
      request,
      { OPENAI_API_KEY: "server-secret" },
      limitedFetch,
    ),
    (error) =>
      error instanceof AiServiceError &&
      error.code === "RATE_LIMITED" &&
      !error.message.includes("server-secret"),
  );
});

test("every advertised provider routes to its official API shape", async () => {
  const cases = [
    {
      provider: "anthropic",
      envName: "ANTHROPIC_API_KEY",
      url: "https://api.anthropic.com/v1/messages",
      response: { content: [{ type: "text", text: '{"questions":[]}' }] },
    },
    {
      provider: "deepseek",
      envName: "DEEPSEEK_API_KEY",
      url: "https://api.deepseek.com/chat/completions",
      response: { choices: [{ message: { content: '{"questions":[]}' } }] },
    },
    {
      provider: "gemini",
      envName: "GEMINI_API_KEY",
      url: "https://generativelanguage.googleapis.com/v1beta/models/",
      response: {
        candidates: [{ content: { parts: [{ text: '{"questions":[]}' }] } }],
      },
    },
    {
      provider: "openrouter",
      envName: "OPENROUTER_API_KEY",
      url: "https://openrouter.ai/api/v1/chat/completions",
      response: { choices: [{ message: { content: '{"questions":[]}' } }] },
    },
    {
      provider: "groq",
      envName: "GROQ_API_KEY",
      url: "https://api.groq.com/openai/v1/chat/completions",
      response: { choices: [{ message: { content: '{"questions":[]}' } }] },
    },
  ];

  for (const item of cases) {
    const provider = AI_PROVIDERS.find(
      (candidate) => candidate.id === item.provider,
    );
    assert.ok(provider);
    const providerRequest = normaliseGenerateRequest({
      ...request,
      provider: item.provider,
      model: provider.models[0].id,
    });
    let requestedUrl = "";
    const fetcher = async (url) => {
      requestedUrl = String(url);
      return new Response(JSON.stringify(item.response), { status: 200 });
    };
    const output = await requestModelText(
      providerRequest,
      { [item.envName]: "server-only-key" },
      fetcher,
    );
    assert.match(
      requestedUrl,
      new RegExp(`^${item.url.replaceAll(".", "\\.")}`),
    );
    assert.equal(output, '{"questions":[]}');
  }
});

test("public worksheet requests are rejected without the family access code", async () => {
  const previous = process.env.WORKSHEET_ACCESS_CODE;
  process.env.WORKSHEET_ACCESS_CODE = "family-test-code";
  let status = 0;
  let body;
  const response = {
    setHeader() {},
    status(code) {
      status = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
    end() {},
  };

  try {
    await generateHandler(
      {
        method: "POST",
        headers: { "x-worksheet-access": "wrong-code" },
        body: request,
      },
      response,
    );
    assert.equal(status, 401);
    assert.equal(body.code, "ACCESS_DENIED");
    assert.doesNotMatch(JSON.stringify(body), /family-test-code|wrong-code/);
  } finally {
    if (previous === undefined) delete process.env.WORKSHEET_ACCESS_CODE;
    else process.env.WORKSHEET_ACCESS_CODE = previous;
  }
});
