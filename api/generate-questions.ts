import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, difficulty, count, topics, apiKey } = req.body;

  if (!subject || !difficulty || !count) {
    return res.status(400).json({ error: 'Missing required fields: subject, difficulty, count' });
  }

  // Use client-provided key or fall back to server env var
  const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!resolvedKey) {
    return res.status(401).json({ error: 'No API key provided. Add your Anthropic API key in Settings.' });
  }

  try {
    const client = new Anthropic({ apiKey: resolvedKey });

    const systemPrompt = `You are an expert 11+ exam question writer for UK grammar school entry.
You write questions aligned with the GL Assessment format used by London grammar schools
(Barnet, Bexley, Bromley, Redbridge, Kingston/Tiffin-style).
Always return ONLY valid JSON — no markdown, no preamble, no trailing text.`;

    const userPrompt = `Generate exactly ${count} ${subject} questions at difficulty level ${difficulty}/3
(1=Year4-5 baseline, 2=Year6 standard, 3=Year6 stretch/hard).
Focus on these topics: ${Array.isArray(topics) ? topics.join(', ') : topics}.

Return a JSON array where each object has:
{
  "id": "ai-${subject}-<index>",
  "subject": "${subject}",
  "topic": "<specific topic>",
  "difficulty": ${difficulty},
  "type": "mcq",
  "question": "<question text>",
  "context": "<optional passage for comprehension, else omit>",
  "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
  "answer": "<A/B/C/D/E>",
  "explanation": "<clear explanation why this is correct, 1-2 sentences>"
}

Rules:
- Questions must be multiple choice with 4-5 options
- For Maths: include a mix of calculation and word problems
- For English: include at least one comprehension passage (100-120 words) with 3-4 questions
- For Verbal Reasoning: use classic GL question formats (analogies, codes, sequences, odd-one-out)
- For Non-Verbal Reasoning: describe shape/pattern relationships in clear text
- All content must be age-appropriate for 9-11 year olds
- Difficulty 3 questions should require multi-step reasoning
- Never repeat questions from obvious common sources
- Vary question styles within each subject`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';

    let questions;
    try {
      questions = JSON.parse(rawText);
    } catch {
      const clean = rawText.replace(/```json|```/g, '').trim();
      questions = JSON.parse(clean);
    }

    return res.status(200).json({ questions });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate questions',
    });
  }
}
