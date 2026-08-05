export const CATEGORY_KEYS = [
  "algebra",
  "multiplication",
  "powers",
  "percentages",
  "wordProblems",
  "geometry",
  "probability",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];
export type ModeKey = CategoryKey | "mixed";

export interface Question {
  /** "numeric" expects a typed value, "compare" expects A/B/equal choice */
  type: "numeric" | "compare";
  typeLabel: string;
  groupLabel: string;
  text: string;
  answer: number;
  explanation: string;
  /** stable-ish signature used to avoid immediate repeats */
  signature: string;
  sourceCategory: CategoryKey;
}

export interface CategoryStat {
  attempts: number;
  correct: number;
  totalTime: number;
  bestTime: number | null;
}

export type StatsMap = Record<CategoryKey, CategoryStat>;

export type LevelMap = Record<CategoryKey, number>;

export interface MissedQuestion {
  question: Question;
  givenAnswer: string;
  at: number;
}

export const CATEGORY_META: Record<
  ModeKey,
  { name: string; description: string; icon: string; accent: string }
> = {
  algebra: {
    name: "תבניות אלגבריות",
    description: "ממוצעים משוקללים, כפל מקוצר, גורם משותף",
    icon: "Σ",
    accent: "var(--accent-indigo)",
  },
  multiplication: {
    name: "כפל וחילוק מהיר",
    description: "כפולות דו-ספרתיות בעל פה",
    icon: "×",
    accent: "var(--accent-sky)",
  },
  powers: {
    name: "חזקות ושורשים",
    description: "ריבועים, שורשים וחזקות שלמות",
    icon: "x²",
    accent: "var(--accent-amber)",
  },
  percentages: {
    name: "אחוזים ושברים",
    description: "שינויי אחוזים, המרה משבר לאחוז",
    icon: "%",
    accent: "var(--accent-emerald)",
  },
  wordProblems: {
    name: "בעיות מילוליות",
    description: "עבודה, מהירות, תערובות, יחסים",
    icon: "W",
    accent: "var(--accent-rose)",
  },
  geometry: {
    name: "גיאומטריה",
    description: "משולשים, שטחים והיקפים",
    icon: "△",
    accent: "var(--accent-teal)",
  },
  probability: {
    name: "הסתברות וקומבינטוריקה",
    description: "סיכויים, סידורים וצירופים",
    icon: "P",
    accent: "var(--accent-fuchsia)",
  },
  mixed: {
    name: "אימון אדפטיבי",
    description: "מתמקד אוטומטית בנושאים בהם הדיוק שלך נמוך יותר",
    icon: "⚡",
    accent: "var(--accent-violet)",
  },
};

export const CATEGORY_NAMES = Object.fromEntries(
  CATEGORY_KEYS.map((k) => [k, CATEGORY_META[k].name]),
) as Record<CategoryKey, string>;
