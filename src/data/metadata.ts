export type Subject = 'maths' | 'english' | 'verbal' | 'nonverbal' | 'mixed';
export type Difficulty = 1 | 2 | 3;
export type QuestionType = 'mcq' | 'text-input';
export type ExamBoard = 'GL' | 'CEM' | 'AQE' | 'CSSE' | 'school-set' | 'mixed';
export type QuestionFormat = 'mcq' | 'creative-writing' | 'written-answer' | 'cloze';

export interface Question {
  id: string;
  subject: 'maths' | 'english' | 'verbal' | 'nonverbal';
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  context?: string;
  options?: string[];
  answer: string;
  explanation: string;
  tags?: string[];
  // Phase 2: regional fields (optional for backwards compatibility)
  region?: string;
  examBoard?: ExamBoard;
  format?: QuestionFormat;
  writingPrompt?: string;
  paper?: string;
}

export interface SubjectMeta {
  id: Subject;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
  topics: string[];
}

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'maths',
    name: 'Maths',
    description: 'Arithmetic, algebra, geometry, fractions, word problems',
    color: '#3B82F6',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-700',
    icon: '🔢',
    topics: ['Arithmetic & BIDMAS', 'Fractions & Decimals', 'Ratios & Percentages', 'Algebra', 'Geometry', 'Data & Statistics'],
  },
  {
    id: 'english',
    name: 'English',
    description: 'Comprehension, grammar, vocabulary, spelling',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-700',
    icon: '📖',
    topics: ['Reading Comprehension', 'Grammar & Punctuation', 'Vocabulary', 'Spelling'],
  },
  {
    id: 'verbal',
    name: 'Verbal Reasoning',
    description: 'Analogies, codes, sequences, word puzzles',
    color: '#10B981',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-700',
    icon: '🔤',
    topics: ['Word Analogies', 'Odd One Out', 'Letter & Number Series', 'Word Codes', 'Hidden Words'],
  },
  {
    id: 'nonverbal',
    name: 'Non-Verbal Reasoning',
    description: 'Patterns, matrices, shape series, spatial reasoning',
    color: '#F59E0B',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-700',
    icon: '🔷',
    topics: ['Shape Series', 'Matrix Patterns', 'Rotations', 'Reflections', 'Odd One Out'],
  },
];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Easy (Year 4–5)',
  2: 'Standard (Year 6)',
  3: 'Stretch (Year 6+)',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-red-100 text-red-700',
};

export const LONDON_GRAMMAR_SCHOOLS = [
  { name: 'Tiffin Boys\' School', area: 'Kingston' },
  { name: 'Tiffin Girls\' School', area: 'Kingston' },
  { name: 'Henrietta Barnett School', area: 'Barnet' },
  { name: 'Queen Elizabeth\'s Boys\' School', area: 'Barnet' },
  { name: 'Nonsuch High School', area: 'Sutton' },
  { name: 'Wallington High School', area: 'Sutton' },
  { name: 'Wilson\'s School', area: 'Sutton' },
  { name: 'St Olave\'s Grammar School', area: 'Bromley' },
  { name: 'Newstead Wood School', area: 'Bromley' },
  { name: 'Beths Grammar School', area: 'Bexley' },
  { name: 'Bexley Grammar School', area: 'Bexley' },
  { name: 'Chislehurst & Sidcup Grammar', area: 'Bexley' },
  { name: 'Ilford County High School', area: 'Redbridge' },
  { name: 'Woodford County High School', area: 'Redbridge' },
];
