import type { Question } from '../data/metadata';
import { getRegionById } from '../data/regions';

interface GenerateParams {
  subject: string;
  difficulty: number;
  count: number;
  topics: string[];
  apiKey: string;
  regionId?: string;
}

function buildRegionalPrompt(regionId: string | undefined): string {
  if (!regionId || regionId === 'london') {
    return 'This is for the London 11+ exam (GL Assessment). Focus on grammar school entry standard for London selective schools such as those in the London Borough of Sutton and Bexley.';
  }
  const region = getRegionById(regionId);
  if (!region) return '';
  const boards = region.examBoards.join(', ');
  const schools = region.notableSchools.slice(0, 3).map(s => s.name).join(', ');
  return `This is for the ${region.name} 11+ exam (${boards}). Test format: ${region.testFormat}. Notable schools in this region: ${schools}. Tailor question style, vocabulary and context to match the ${boards} exam board style.`;
}

export async function generateQuestionsFromAI(params: GenerateParams): Promise<Question[]> {
  const regionContext = buildRegionalPrompt(params.regionId);
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: params.subject,
      difficulty: params.difficulty,
      count: params.count,
      topics: params.topics,
      apiKey: params.apiKey,
      regionContext,
      regionId: params.regionId,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.questions as Question[];
}
