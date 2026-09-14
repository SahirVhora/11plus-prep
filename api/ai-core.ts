import { isAllowedAiModel, type AiProviderId } from "../src/api/aiCatalog.ts";

export interface GenerateRequest {
  provider: AiProviderId;
  model: string;
  subject: "maths" | "english" | "verbal" | "nonverbal" | "mixed";
  difficulty: 1 | 2 | 3;
  count: number;
  topics: string[];
  regionContext: string;
}

export interface GeneratedQuestion {
  id: string;
  subject: Exclude<GenerateRequest["subject"], "mixed">;
  topic: string;
  difficulty: 1 | 2 | 3;
  type: "mcq";
  question: string;
  context?: string;
  options: string[];
  answer: string;
  explanation: string;
}

type Environment = Record<string, string | undefined>;
type FetchLike = typeof fetch;

const PROVIDER_KEYS: Record<AiProviderId, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  gemini: "GEMINI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  groq: "GROQ_API_KEY",
};

const MAX_QUESTION_COUNT = 30;
const MAX_TEXT_LENGTH = 2_000;

export class AiServiceError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function configuredProviders(env: Environment): AiProviderId[] {
  return (Object.keys(PROVIDER_KEYS) as AiProviderId[]).filter((provider) =>
    Boolean(env[PROVIDER_KEYS[provider]]),
  );
}

export function normaliseGenerateRequest(body: unknown): GenerateRequest {
  if (!body || typeof body !== "object") {
    throw new AiServiceError(
      400,
      "INVALID_REQUEST",
      "Request body must be a JSON object.",
    );
  }

  const candidate = body as Partial<GenerateRequest>;
  const subjects = ["maths", "english", "verbal", "nonverbal", "mixed"];
  const provider =
    typeof candidate.provider === "string" ? candidate.provider : "";
  const model = typeof candidate.model === "string" ? candidate.model : "";
  const count = Number(candidate.count);
  const difficulty = Number(candidate.difficulty);

  if (!isAllowedAiModel(provider, model)) {
    throw new AiServiceError(
      400,
      "UNSUPPORTED_MODEL",
      "Choose a supported AI provider and model.",
    );
  }
  if (!subjects.includes(String(candidate.subject))) {
    throw new AiServiceError(
      400,
      "INVALID_SUBJECT",
      "Choose a supported worksheet subject.",
    );
  }
  if (![1, 2, 3].includes(difficulty)) {
    throw new AiServiceError(
      400,
      "INVALID_DIFFICULTY",
      "Difficulty must be 1, 2 or 3.",
    );
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_QUESTION_COUNT) {
    throw new AiServiceError(
      400,
      "INVALID_COUNT",
      `AI worksheets support 1-${MAX_QUESTION_COUNT} questions per request.`,
    );
  }

  const topics = Array.isArray(candidate.topics)
    ? candidate.topics
        .filter((topic): topic is string => typeof topic === "string")
        .map((topic) => topic.trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 12)
    : [];

  return {
    provider: provider as AiProviderId,
    model,
    subject: candidate.subject as GenerateRequest["subject"],
    difficulty: difficulty as GenerateRequest["difficulty"],
    count,
    topics: topics.length ? topics : ["general"],
    regionContext:
      typeof candidate.regionContext === "string"
        ? candidate.regionContext.trim().slice(0, 1_500)
        : "General UK 11+ practice.",
  };
}

export function buildPrompts(request: GenerateRequest): {
  system: string;
  user: string;
} {
  const system = `You are an expert UK 11+ question writer. Create original, accurate and age-appropriate material for children aged 9-11. Do not request or infer personal data. Return only valid JSON matching the requested structure.`;
  const user = `Create exactly ${request.count} ${request.subject} multiple-choice questions at difficulty ${request.difficulty}/3.
Topics: ${request.topics.join(", ")}.
Regional context: ${request.regionContext}
${request.subject === "mixed" ? "Distribute the questions as evenly as possible across maths, English, verbal reasoning and non-verbal reasoning." : ""}

Return one JSON object with a "questions" array. Each question must contain:
- subject (maths, english, verbal or nonverbal), topic, difficulty, type (always "mcq"), question
- exactly 4 or 5 options prefixed A), B), C), D) and optionally E)
- answer as a single matching letter
- a concise explanation
- optional context for comprehension

Use classic GL-style verbal and non-verbal formats where relevant. Difficulty 3 should require multi-step reasoning. Avoid copied questions, trick ambiguity, stereotypes, frightening topics, advertising and personal information.`;
  return { system, user };
}

function providerKey(provider: AiProviderId, env: Environment): string {
  const key = env[PROVIDER_KEYS[provider]];
  if (!key)
    throw new AiServiceError(
      503,
      "PROVIDER_NOT_CONFIGURED",
      "That AI provider is not configured. Choose another model or Free Practice.",
    );
  return key;
}

async function providerResponse(
  response: Response,
  provider: AiProviderId,
): Promise<unknown> {
  if (response.ok) return response.json();
  if (response.status === 401 || response.status === 403) {
    throw new AiServiceError(
      503,
      "PROVIDER_AUTH",
      `${provider} is temporarily unavailable. Choose another model or Free Practice.`,
    );
  }
  if (response.status === 429) {
    throw new AiServiceError(
      429,
      "RATE_LIMITED",
      `${provider} has reached its current usage limit. Try another model or Free Practice.`,
    );
  }
  throw new AiServiceError(
    502,
    "PROVIDER_ERROR",
    `${provider} could not generate this worksheet. Try another model or Free Practice.`,
  );
}

function readOpenAiText(data: unknown): string {
  const candidate = data as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (typeof candidate.output_text === "string") return candidate.output_text;
  return (
    candidate.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === "output_text")?.text ?? ""
  );
}

function readChatText(data: unknown): string {
  const candidate = data as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  return typeof candidate.choices?.[0]?.message?.content === "string"
    ? candidate.choices[0].message.content
    : "";
}

function readAnthropicText(data: unknown): string {
  const candidate = data as {
    content?: Array<{ type?: string; text?: unknown }>;
  };
  const text = candidate.content?.find((item) => item.type === "text")?.text;
  return typeof text === "string" ? text : "";
}

function readGeminiText(data: unknown): string {
  const candidate = data as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
  };
  const text = candidate.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .find((part) => typeof part === "string");
  return typeof text === "string" ? text : "";
}

export async function requestModelText(
  request: GenerateRequest,
  env: Environment,
  fetcher: FetchLike = fetch,
): Promise<string> {
  const key = providerKey(request.provider, env);
  const prompts = buildPrompts(request);
  const signal = AbortSignal.timeout(45_000);
  let response: Response;

  if (request.provider === "openai") {
    response = await fetcher("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        instructions: prompts.system,
        input: prompts.user,
        max_output_tokens: 8_000,
      }),
      signal,
    });
    return readOpenAiText(await providerResponse(response, request.provider));
  }

  if (request.provider === "anthropic") {
    response = await fetcher("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: 8_000,
        system: prompts.system,
        messages: [{ role: "user", content: prompts.user }],
      }),
      signal,
    });
    return readAnthropicText(
      await providerResponse(response, request.provider),
    );
  }

  if (request.provider === "gemini") {
    response = await fetcher(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(request.model)}:generateContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompts.system }] },
          contents: [{ role: "user", parts: [{ text: prompts.user }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8_000,
          },
        }),
        signal,
      },
    );
    return readGeminiText(await providerResponse(response, request.provider));
  }

  const endpoints: Record<"deepseek" | "openrouter" | "groq", string> = {
    deepseek: "https://api.deepseek.com/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
    groq: "https://api.groq.com/openai/v1/chat/completions",
  };
  const provider = request.provider as keyof typeof endpoints;
  response = await fetcher(endpoints[provider], {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(provider === "openrouter"
        ? {
            "HTTP-Referer": "https://sahirvhora.github.io/11plus-prep/",
            "X-Title": "Grammar Journey",
          }
        : {}),
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: "system", content: prompts.system },
        { role: "user", content: prompts.user },
      ],
      max_tokens: 8_000,
      temperature: 0.4,
      ...(provider === "openrouter"
        ? {}
        : { response_format: { type: "json_object" } }),
    }),
    signal,
  });
  return readChatText(await providerResponse(response, request.provider));
}

function cleanJson(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  if (!trimmed)
    throw new AiServiceError(
      502,
      "EMPTY_RESPONSE",
      "The AI provider returned an empty worksheet.",
    );
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new AiServiceError(
      502,
      "INVALID_RESPONSE",
      "The AI provider returned an invalid worksheet. Try another model.",
    );
  }
}

function safeText(value: unknown, max = MAX_TEXT_LENGTH): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validateGeneratedQuestions(
  text: string,
  request: GenerateRequest,
): GeneratedQuestion[] {
  const parsed = cleanJson(text) as { questions?: unknown } | unknown[];
  const items = Array.isArray(parsed) ? parsed : parsed?.questions;
  if (!Array.isArray(items) || items.length !== request.count) {
    throw new AiServiceError(
      502,
      "INVALID_RESPONSE",
      `The AI provider did not return exactly ${request.count} valid questions.`,
    );
  }

  const questions: GeneratedQuestion[] = items.map((raw, index) => {
    if (!raw || typeof raw !== "object")
      throw new AiServiceError(
        502,
        "INVALID_RESPONSE",
        "The AI provider returned a malformed question.",
      );
    const item = raw as Record<string, unknown>;
    const options = Array.isArray(item.options)
      ? item.options.map((option) => safeText(option, 500)).filter(Boolean)
      : [];
    const answer = safeText(item.answer, 1).toUpperCase();
    const question = safeText(item.question);
    const explanation = safeText(item.explanation);
    const topic = safeText(item.topic, 100);
    const generatedSubject =
      request.subject === "mixed"
        ? safeText(item.subject, 20)
        : request.subject;
    const allowedSubjects = ["maths", "english", "verbal", "nonverbal"];
    const validAnswers = options.map((_, optionIndex) =>
      String.fromCharCode(65 + optionIndex),
    );
    const optionsAreLabelled = options.every((option, optionIndex) =>
      option.startsWith(`${String.fromCharCode(65 + optionIndex)})`),
    );

    if (
      !question ||
      !explanation ||
      !topic ||
      !allowedSubjects.includes(generatedSubject) ||
      options.length < 4 ||
      options.length > 5 ||
      !optionsAreLabelled ||
      !validAnswers.includes(answer)
    ) {
      throw new AiServiceError(
        502,
        "INVALID_RESPONSE",
        "The AI provider returned a question that failed quality checks.",
      );
    }

    return {
      id: `ai-${request.provider}-${request.subject}-${index + 1}`,
      subject: generatedSubject as GeneratedQuestion["subject"],
      topic,
      difficulty: request.difficulty,
      type: "mcq",
      question,
      ...(safeText(item.context, 4_000)
        ? { context: safeText(item.context, 4_000) }
        : {}),
      options,
      answer,
      explanation,
    };
  });

  const uniqueQuestions = new Set(
    questions.map((question) => question.question.toLocaleLowerCase()),
  );
  if (uniqueQuestions.size !== questions.length) {
    throw new AiServiceError(
      502,
      "INVALID_RESPONSE",
      "The AI provider returned duplicate questions. Try another model.",
    );
  }
  return questions;
}
