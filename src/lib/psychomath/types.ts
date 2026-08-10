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
  /** תמיד קלט מספרי — פורמט ההשוואה A/B הוסר */
  type: "numeric";

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

/**
 * לכל נושא אייקון עגול עם מילוי גרדיאנט משלישיית המותג בלבד
 * (קורל / ליים / ציאן, ועוד סגול לרגעי שיא) — בלי "רעש" צבעוני שרירותי.
 */
export const CATEGORY_META: Record<
  ModeKey,
  { name: string; description: string; icon: string; accent: string; gradient: string }
> = {
  algebra: {
    name: "תבניות אלגבריות",
    description: "משוואות, ממוצעים משוקללים וכפל מקוצר",
    icon: "Σ",
    accent: "var(--brand-violet)",
    gradient: "linear-gradient(135deg, var(--brand-violet), var(--brand-cyan))",
  },
  multiplication: {
    name: "כפל וחילוק מהיר",
    description: "כפולות דו-ספרתיות בעל פה",
    icon: "×",
    accent: "var(--brand-cyan)",
    gradient: "linear-gradient(135deg, var(--brand-cyan), var(--brand-lime))",
  },
  powers: {
    name: "חזקות ושורשים",
    description: "ריבועים, שורשים וחזקות שלמות",
    icon: "x²",
    accent: "var(--brand-lime)",
    gradient: "linear-gradient(135deg, var(--brand-lime), var(--brand-coral))",
  },
  percentages: {
    name: "אחוזים ושברים",
    description: "שינויי אחוזים, המרה משבר לאחוז",
    icon: "%",
    accent: "var(--brand-coral)",
    gradient: "linear-gradient(135deg, var(--brand-coral), var(--brand-violet))",
  },
  wordProblems: {
    name: "בעיות מילוליות",
    description: "עבודה, מהירות, תערובות, יחסים",
    icon: "W",
    accent: "var(--brand-cyan)",
    gradient: "linear-gradient(135deg, var(--brand-cyan), var(--brand-coral))",
  },
  geometry: {
    name: "גיאומטריה",
    description: "משולשים, שטחים והיקפים",
    icon: "△",
    accent: "var(--brand-violet)",
    gradient: "linear-gradient(135deg, var(--brand-violet), var(--brand-lime))",
  },
  probability: {
    name: "הסתברות וקומבינטוריקה",
    description: "סיכויים, סידורים וצירופים",
    icon: "P",
    accent: "var(--brand-coral)",
    gradient: "linear-gradient(135deg, var(--brand-coral), var(--brand-lime))",
  },
  mixed: {
    name: "אימון אדפטיבי",
    description: "מתמקד אוטומטית בנושאים בהם הדיוק שלך נמוך יותר",
    icon: "⚡",
    accent: "var(--brand-cyan)",
    gradient: "var(--gradient-trio)",
  },
};


export const CATEGORY_NAMES = Object.fromEntries(
  CATEGORY_KEYS.map((k) => [k, CATEGORY_META[k].name]),
) as Record<CategoryKey, string>;
