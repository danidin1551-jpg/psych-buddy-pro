import { CATEGORY_KEYS, CATEGORY_META, type CategoryKey, type Question } from "@/lib/psychomath/types";
import { generateQuestion, isAnswerCorrect } from "@/lib/psychomath/generators";
import type { StatsMap } from "@/lib/psychomath/types";

export const emptyStats = (): StatsMap =>
  Object.fromEntries(
    CATEGORY_KEYS.map((c) => [c, { attempts: 0, correct: 0, totalTime: 0, bestTime: null }]),
  ) as StatsMap;

export const levelsAt = (level: number) =>
  Object.fromEntries(CATEGORY_KEYS.map((c) => [c, level])) as Record<CategoryKey, number>;

export interface Payload {
  answer: number;
  explanation: string;
  type: Question["type"];
}

/** אסימון אטום (stateless) שמכיל את התשובה וההסבר, כדי ש-check_answer יוכל לבדוק */
export function encodePayload(p: Payload): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(p))));
}

export function decodePayload(token: string): Payload | null {
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(escape(atob(token))));
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as Payload).answer === "number" &&
      typeof (parsed as Payload).explanation === "string"
    ) {
      return parsed as Payload;
    }
    return null;
  } catch {
    return null;
  }
}

export function makeQuestion(topic: CategoryKey | "mixed", level: number, recent: string[] = []) {
  const q = generateQuestion(topic, levelsAt(level), emptyStats(), recent);
  return {
    question: q,
    public: {
      topic: q.sourceCategory,
      topic_name: CATEGORY_META[q.sourceCategory].name,
      level,
      type: q.type,
      type_label: q.typeLabel,
      group_label: q.groupLabel,
      text: q.text,
      answer_format:
        q.type === "compare"
          ? "בחירה: 0 = A גדול יותר, 1 = B גדול יותר, 2 = שווים"
          : "מספר (אפשר עשרוני)",
      answer_token: encodePayload({
        answer: q.answer,
        explanation: q.explanation,
        type: q.type,
      }),
    },
  };
}

export function checkAgainstToken(token: string, answer: string) {
  const payload = decodePayload(token);
  if (!payload) return null;
  return {
    correct: isAnswerCorrect(answer, payload.answer),
    correct_answer: payload.answer,
    explanation: payload.explanation,
  };
}
