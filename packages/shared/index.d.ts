export type Target = 'Mars' | 'Oy' | 'Ikkalasi';

export interface Location {
  id: string;
  name: string;
  country: string;
  target: Target;
  terrain: string;
  lat: number;
  lng: number;
  summary: string;
  explanation: string;
  limitation: string;
  features: string[];
  sources: { title: string; url: string }[];
  image: string;
  imageCredit: string;
  color: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  locationId: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: number;
}

/** A question safe to send to a browser: the correct option and its explanation stay server-side. */
export type PublicQuestion = Omit<Question, 'answer' | 'explanation'>;

export interface QuizFeedback {
  questionId: string;
  correct: boolean;
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  results: QuizFeedback[];
}

export const locations: Location[];
export const questions: Question[];
export function filterLocations(query?: { q?: string; target?: string; terrain?: string }, catalog?: Location[]): Location[];
/** Rejects empty, duplicate, unknown, sparse and out-of-range answers. Partial quizzes are supported. */
export function gradeQuiz(answers: QuizAnswer[]): QuizResult;
/** Returns questions without `answer` or `explanation` so clients cannot pre-compute the score. */
export function toPublicQuestions(list?: Question[]): PublicQuestion[];
