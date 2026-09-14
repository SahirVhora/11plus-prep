export type AiProviderId =
  "openai" | "anthropic" | "deepseek" | "gemini" | "openrouter" | "groq";

export interface AiModelOption {
  id: string;
  label: string;
  tier: "balanced" | "premium" | "budget" | "free";
  description: string;
}

export interface AiProviderOption {
  id: AiProviderId;
  label: string;
  icon: string;
  description: string;
  models: AiModelOption[];
}

export const AI_PROVIDERS: AiProviderOption[] = [
  {
    id: "openai",
    label: "OpenAI",
    icon: "◎",
    description: "Strong structured output and reliable explanations.",
    models: [
      {
        id: "gpt-5.6-luna",
        label: "GPT-5.6 Luna",
        tier: "balanced",
        description: "Recommended for everyday worksheets",
      },
      {
        id: "gpt-5.6-terra",
        label: "GPT-5.6 Terra",
        tier: "premium",
        description: "Stronger reasoning for stretch work",
      },
    ],
  },
  {
    id: "anthropic",
    label: "Claude",
    icon: "A",
    description: "Careful wording and clear teaching explanations.",
    models: [
      {
        id: "claude-sonnet-4-6",
        label: "Claude Sonnet 4.6",
        tier: "balanced",
        description: "Recommended Claude balance",
      },
      {
        id: "claude-opus-4-6",
        label: "Claude Opus 4.6",
        tier: "premium",
        description: "Highest-quality Claude option",
      },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    icon: "D",
    description: "Low-cost reasoning with JSON output support.",
    models: [
      {
        id: "deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        tier: "budget",
        description: "Fast and economical",
      },
      {
        id: "deepseek-v4-pro",
        label: "DeepSeek V4 Pro",
        tier: "premium",
        description: "Deeper reasoning",
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    icon: "✦",
    description: "Fast Google models with a provider-managed free tier.",
    models: [
      {
        id: "gemini-3.5-flash-lite",
        label: "Gemini 3.5 Flash-Lite",
        tier: "free",
        description: "Free-tier friendly and fast",
      },
      {
        id: "gemini-3.8-flash",
        label: "Gemini 3.8 Flash",
        tier: "balanced",
        description: "Stronger general-purpose generation",
      },
    ],
  },
  {
    id: "openrouter",
    label: "OpenRouter Free",
    icon: "↗",
    description: "Automatically selects an available free model.",
    models: [
      {
        id: "openrouter/free",
        label: "Free Models Router",
        tier: "free",
        description: "Zero-cost, lower limits and variable availability",
      },
    ],
  },
  {
    id: "groq",
    label: "Groq Free",
    icon: "⚡",
    description: "Very fast open-model generation on Groq's free plan.",
    models: [
      {
        id: "openai/gpt-oss-20b",
        label: "GPT-OSS 20B",
        tier: "free",
        description: "Fast, schema-capable free-plan option",
      },
      {
        id: "openai/gpt-oss-120b",
        label: "GPT-OSS 120B",
        tier: "free",
        description: "Stronger free-plan reasoning",
      },
    ],
  },
];

export const DEFAULT_AI_PROVIDER: AiProviderId = "openai";
export const DEFAULT_AI_MODEL = AI_PROVIDERS[0].models[0].id;

export function getAiProvider(id: string): AiProviderOption | undefined {
  return AI_PROVIDERS.find((provider) => provider.id === id);
}

export function isAllowedAiModel(providerId: string, modelId: string): boolean {
  return Boolean(
    getAiProvider(providerId)?.models.some((model) => model.id === modelId),
  );
}
