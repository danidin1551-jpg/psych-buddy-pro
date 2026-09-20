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

  // Prefer questions we have not shown recently from the entire bank.
  // This prevents low-level sessions from getting stuck on only the
  // difficulty-2 questions when the bank contains several difficulty levels.
  const unseen = QUESTION_BANK.filter(
    (q) => !recentSignatures.includes(`psychometric|${q.id}`),
  );

  // When there are unseen questions, prefer those near the current level,
  // but fall back to any unseen question so the full bank gets rotation.
  const preferredUnseen = unseen.filter((q) => Math.abs(q.difficulty - target) <= 1);
  const source =
    preferredUnseen.length > 0
      ? preferredUnseen
      : unseen.length > 0
        ? unseen
        : QUESTION_BANK;

  return toQuestion(source[Math.floor(Math.random() * source.length)]!);
}
