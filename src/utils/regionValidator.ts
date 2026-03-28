/**
 * regionValidator.ts
 * Validates regional question bank JSON files for consistency and completeness.
 * Run via: npm run validate-regions
 */

import fs from 'fs';
import path from 'path';

const QUESTIONS_DIR = path.join(process.cwd(), 'src/data/questions');

const VALID_SUBJECTS = ['maths', 'english', 'verbal', 'nonverbal'] as const;
const VALID_DIFFICULTIES = [1, 2, 3] as const;
const VALID_TYPES = ['mcq', 'text-input'] as const;
const VALID_EXAM_BOARDS = ['GL', 'CEM', 'AQE', 'CSSE', 'school-set', 'mixed'] as const;

interface ValidationError {
  file: string;
  questionId: string;
  field: string;
  message: string;
}

interface ValidationResult {
  file: string;
  questionCount: number;
  errors: ValidationError[];
  warnings: string[];
  subjectBreakdown: Record<string, number>;
  difficultyBreakdown: Record<number, number>;
}

// Question shape expected
interface RawQuestion {
  id?: unknown;
  subject?: unknown;
  topic?: unknown;
  difficulty?: unknown;
  type?: unknown;
  question?: unknown;
  options?: unknown;
  answer?: unknown;
  explanation?: unknown;
  region?: unknown;
  examBoard?: unknown;
  format?: unknown;
  writingPrompt?: unknown;
  paper?: unknown;
}

function validateQuestionBank(filePath: string): ValidationResult {
  const filename = path.basename(filePath);
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const subjectBreakdown: Record<string, number> = {};
  const difficultyBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  const seenIds = new Set<string>();

  let questions: RawQuestion[];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    questions = JSON.parse(raw);
  } catch (err: unknown) {
    return {
      file: filename,
      questionCount: 0,
      errors: [{ file: filename, questionId: 'N/A', field: 'file', message: `Failed to parse JSON: ${String(err)}` }],
      warnings,
      subjectBreakdown,
      difficultyBreakdown,
    };
  }

  if (!Array.isArray(questions)) {
    return {
      file: filename,
      questionCount: 0,
      errors: [{ file: filename, questionId: 'N/A', field: 'root', message: 'Root element must be an array' }],
      warnings,
      subjectBreakdown,
      difficultyBreakdown,
    };
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qid = typeof q.id === 'string' ? q.id : `[index ${i}]`;

    // id
    if (typeof q.id !== 'string' || q.id.trim() === '') {
      errors.push({ file: filename, questionId: qid, field: 'id', message: 'Missing or non-string id' });
    } else if (seenIds.has(q.id)) {
      errors.push({ file: filename, questionId: q.id, field: 'id', message: 'Duplicate id' });
    } else {
      seenIds.add(q.id);
    }

    // subject
    if (!VALID_SUBJECTS.includes(q.subject as typeof VALID_SUBJECTS[number])) {
      errors.push({ file: filename, questionId: qid, field: 'subject', message: `Invalid subject: "${q.subject}". Must be one of ${VALID_SUBJECTS.join(', ')}` });
    } else {
      const s = q.subject as string;
      subjectBreakdown[s] = (subjectBreakdown[s] ?? 0) + 1;
    }

    // topic
    if (typeof q.topic !== 'string' || q.topic.trim() === '') {
      errors.push({ file: filename, questionId: qid, field: 'topic', message: 'Missing or empty topic' });
    }

    // difficulty
    if (!VALID_DIFFICULTIES.includes(q.difficulty as typeof VALID_DIFFICULTIES[number])) {
      errors.push({ file: filename, questionId: qid, field: 'difficulty', message: `Invalid difficulty: "${q.difficulty}". Must be 1, 2, or 3` });
    } else {
      const d = q.difficulty as number;
      difficultyBreakdown[d] = (difficultyBreakdown[d] ?? 0) + 1;
    }

    // type
    if (!VALID_TYPES.includes(q.type as typeof VALID_TYPES[number])) {
      errors.push({ file: filename, questionId: qid, field: 'type', message: `Invalid type: "${q.type}". Must be "mcq" or "text-input"` });
    }

    // question text
    if (typeof q.question !== 'string' || q.question.trim() === '') {
      errors.push({ file: filename, questionId: qid, field: 'question', message: 'Missing or empty question text' });
    }

    // options — required for mcq
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length < 3) {
        errors.push({ file: filename, questionId: qid, field: 'options', message: 'MCQ must have at least 3 options' });
      } else if (q.options.some((o) => typeof o !== 'string' || (o as string).trim() === '')) {
        errors.push({ file: filename, questionId: qid, field: 'options', message: 'All options must be non-empty strings' });
      }
    }

    // answer
    if (typeof q.answer !== 'string' || q.answer.trim() === '') {
      errors.push({ file: filename, questionId: qid, field: 'answer', message: 'Missing or empty answer' });
    } else if (q.type === 'mcq') {
      const ans = (q.answer as string).toUpperCase();
      const validLetters = ['A', 'B', 'C', 'D', 'E'];
      if (!validLetters.includes(ans)) {
        errors.push({ file: filename, questionId: qid, field: 'answer', message: `MCQ answer "${q.answer}" must be a letter A–E` });
      }
    }

    // explanation
    if (typeof q.explanation !== 'string' || q.explanation.trim() === '') {
      errors.push({ file: filename, questionId: qid, field: 'explanation', message: 'Missing or empty explanation' });
    }

    // examBoard — optional but if present must be valid
    if (q.examBoard !== undefined && !VALID_EXAM_BOARDS.includes(q.examBoard as typeof VALID_EXAM_BOARDS[number])) {
      warnings.push(`Q ${qid}: examBoard "${q.examBoard}" is not a recognised value`);
    }

    // creative-writing questions should have writingPrompt
    if (q.format === 'creative-writing' && !q.writingPrompt) {
      warnings.push(`Q ${qid}: format is "creative-writing" but writingPrompt is missing`);
    }
  }

  // Warn if fewer than 20 questions
  if (questions.length < 20) {
    warnings.push(`Only ${questions.length} questions — consider adding more for variety`);
  }

  // Warn if all same difficulty
  const nonZeroDiffs = Object.values(difficultyBreakdown).filter((v) => v > 0);
  if (nonZeroDiffs.length === 1) {
    warnings.push('All questions are the same difficulty — add mixed difficulty levels');
  }

  return {
    file: filename,
    questionCount: questions.length,
    errors,
    warnings,
    subjectBreakdown,
    difficultyBreakdown,
  };
}

function main() {
  const files = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error(`No JSON files found in ${QUESTIONS_DIR}`);
    process.exit(1);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of files) {
    const result = validateQuestionBank(path.join(QUESTIONS_DIR, file));
    const errorCount = result.errors.length;
    const warnCount = result.warnings.length;
    totalErrors += errorCount;
    totalWarnings += warnCount;

    const status = errorCount === 0 ? '✅' : '❌';
    console.log(`\n${status} ${result.file} — ${result.questionCount} questions`);
    console.log(`   Subjects: ${JSON.stringify(result.subjectBreakdown)}`);
    console.log(`   Difficulty: ${JSON.stringify(result.difficultyBreakdown)}`);

    if (warnCount > 0) {
      for (const w of result.warnings) {
        console.log(`   ⚠️  ${w}`);
      }
    }
    if (errorCount > 0) {
      for (const e of result.errors) {
        console.log(`   🔴 [${e.questionId}] ${e.field}: ${e.message}`);
      }
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Validated ${files.length} file(s). ${totalErrors} error(s), ${totalWarnings} warning(s).`);

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main();
