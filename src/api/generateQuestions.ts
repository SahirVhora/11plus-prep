import type { Question } from "../data/metadata";
import { getRegionById } from "../data/regions";
import type { AiProviderId } from "./aiCatalog";

interface GenerateParams {
  subject: "maths" | "english" | "verbal" | "nonverbal" | "mixed";
  difficulty: number;
  count: number;
  topics: string[];
  provider: AiProviderId;
  model: string;
  accessCode: string;
  regionId?: string;
}

export interface AiServiceStatus {
  reachable: boolean;
  availableProviders: AiProviderId[];
}

const configuredBaseUrl = (import.meta.env.VITE_AI_API_URL ?? "")
  .trim()
  .replace(/\/$/, "");

function endpoint(path: string): string {
  return `${configuredBaseUrl}${path}`;
}

function buildRegionalPrompt(regionId: string | undefined): string {
  if (!regionId || regionId === "london") {
    return "This is for the London 11+ exam. Focus on grammar-school entry standard and the selected school's current exam format.";
  }
  const region = getRegionById(regionId);
  if (!region) return "General UK 11+ practice.";
  const boards = region.examBoards.join(", ");
  const schools = region.notableSchools
    .slice(0, 3)
    .map((school) => school.name)
    .join(", ");
  return `This is for the ${region.name} 11+ exam (${boards}). Test format: ${region.testFormat}. Example schools: ${schools}. Tailor the style to the published regional format without claiming to reproduce proprietary questions.`;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string") return body.error;
  } catch {
    // Use the safe generic message below for HTML, empty or malformed errors.
  }
  return `The AI service returned error ${response.status}. Try another model or Free Practice.`;
}

export async function getAiServiceStatus(): Promise<AiServiceStatus> {
  try {
    const response = await fetch(endpoint("/api/models"), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return { reachable: false, availableProviders: [] };
    const body = (await response.json()) as {
      providers?: Array<{ id?: unknown; available?: unknown }>;
    };
    const allowed: AiProviderId[] = [
      "openai",
      "anthropic",
      "deepseek",
      "gemini",
      "openrouter",
      "groq",
    ];
    const availableProviders = (body.providers ?? [])
      .filter(
        (provider) =>
          provider.available === true &&
          allowed.includes(provider.id as AiProviderId),
      )
      .map((provider) => provider.id as AiProviderId);
    return { reachable: true, availableProviders };
  } catch {
    return { reachable: false, availableProviders: [] };
  }
}

export async function generateQuestionsFromAI(
  params: GenerateParams,
): Promise<Question[]> {
  let response: Response;
  try {
    response = await fetch(endpoint("/api/generate-questions"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Worksheet-Access": params.accessCode,
      },
      body: JSON.stringify({
        subject: params.subject,
        difficulty: params.difficulty,
        count: params.count,
        topics: params.topics,
        provider: params.provider,
        model: params.model,
        regionContext: buildRegionalPrompt(params.regionId),
      }),
    });
  } catch {
    throw new Error(
      "The secure AI service is unreachable. Try Free Practice or return later.",
    );
  }

  if (!response.ok) throw new Error(await readError(response));
  const data = (await response.json()) as { questions?: unknown };
  if (!Array.isArray(data.questions))
    throw new Error(
      "The AI service returned an invalid worksheet. Try another model.",
    );
  return data.questions as Question[];
}
