import rawQuestions from "@/data/psychometricQuestions.json";
import type { Question } from "./types";

export interface PsychometricQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  psychometricTip?: string;
}

const QUESTION_BANK = rawQuestions as PsychometricQuestion[];

const difficultyForLevel = (level: number) =>
  Math.max(1, Math.min(4, Math.ceil(Math.max(1, Math.min(10, level)) / 3)));

function toQuestion(item: PsychometricQuestion): Question {
  return {
    type: "multipleChoice",
    typeLabel: item.subtopic,
    groupLabel: `פסיכומטרי · ${item.topic}`,
    text: item.question,
    answer: item.correctAnswer,
    explanation: item.explanation,
    ...(item.psychometricTip ? { tip: item.psychometricTip } : {}),
    signature: `psychometric|${item.id}`,
    sourceCategory: "psychometric",
    options: item.options,
  };
}

export function getPsychometricQuestions(): Question[] {
  return QUESTION_BANK.map(toQuestion);
}

export function getRandomPsychometricQuestion(level = 1, recentSignatures: string[] = []): Question {
  const target = difficultyForLevel(level);
  const candidates = QUESTION_BANK.filter((q) => Math.abs(q.difficulty - target) <= 1);
  const pool = candidates.length > 0 ? candidates : QUESTION_BANK;
  const unseen = pool.filter((q) => !recentSignatures.includes(`psychometric|${q.id}`));
  const source = unseen.length > 0 ? unseen : pool;
  return toQuestion(source[Math.floor(Math.random() * source.length)]!);
}
