import {
  CATEGORY_KEYS,
  type CategoryKey,
  type Question,
  type StatsMap,
} from "./types";

type RawQuestion = Omit<Question, "signature" | "sourceCategory">;

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

/* ============================== אלגברה ============================== */

function generateCompareQuestion(): RawQuestion {
  const scenario = randInt(0, 3);
  if (scenario === 0) {
    return {
      type: "compare",
      typeLabel: "התנהגות אלגברית",
      groupLabel: "אלגברה · אי-שוויונות",
      text: "נתון ש-x הוא שבר חיובי בין 0 ל-1\n\nA: x²\nB: x",
      answer: 1,
      explanation: "שבר בין 0 ל-1 קטן ככל שהחזקה גדלה (למשל ½²=¼<½). לכן B גדול יותר.",
    };
  }
  if (scenario === 1) {
    return {
      type: "compare",
      typeLabel: "התנהגות אלגברית",
      groupLabel: "אלגברה · אי-שוויונות",
      text: "נתון ש-x הוא מספר שלם שלילי (x < -1)\n\nA: x²\nB: x",
      answer: 0,
      explanation: "מספר שלילי בריבוע הופך לחיובי, בעוד x עצמו נשאר שלילי. לכן A גדול יותר.",
    };
  }
  if (scenario === 2) {
    return {
      type: "compare",
      typeLabel: "התנהגות אלגברית",
      groupLabel: "אלגברה · אי-שוויונות",
      text: "נתון ש-x הוא שבר חיובי בין 0 ל-1\n\nA: x\nB: √x",
      answer: 1,
      explanation:
        "עבור שבר בין 0 ל-1, השורש שלו תמיד גדול מהמספר עצמו (למשל √¼=½>¼). לכן B גדול יותר.",
    };
  }
  return {
    type: "compare",
    typeLabel: "התנהגות אלגברית",
    groupLabel: "אלגברה · זהויות",
    text: "נתון a>0 ו-b>0 (שניהם שונים מאפס)\n\nA: (a+b)²\nB: a² + b²",
    answer: 0,
    explanation: "לפי הזהות (a+b)² = a²+2ab+b². מכיוון ש-2ab>0, A תמיד גדול מ-B.",
  };
}

function generateAlgebraQuestion(level: number): RawQuestion {
  const roll = Math.random();
  if (roll < 0.25) {
    const step = level > 5 ? 5 : 10;
    const multOptions = level <= 3 ? [2, 3] : level <= 7 ? [2, 3, 4] : [2, 3, 4, 5];
    const multiplier = pick(multOptions);
    const devA = step * multiplier;
    const devB = step;
    const margin = randInt(2, 5) * 10;
    const baseAvg = devA + margin;
    const avgA = baseAvg - devA;
    const avgB = baseAvg + devB;
    return {
      type: "numeric",
      typeLabel: "ממוצע משוקלל: יחס סטיות",
      groupLabel: "אלגברה · ממוצעים",
      text: `ממוצע קבוצה א': ${avgA}\nממוצע קבוצה ב': ${avgB}\nהממוצע המשוקלל: ${baseAvg}\n\nפי כמה גדול מספר האיברים בקבוצה ב' לעומת קבוצה א'?`,
      answer: multiplier,
      explanation: `הפרש א' מהממוצע: ${devA}. הפרש ב' מהממוצע: ${devB}.\nיחס הכמויות הפוך ליחס המרחקים: קבוצה ב' גדולה פי ${devA}/${devB} = ${multiplier} מקבוצה א'.`,
    };
  }
  if (roll < 0.45) {
    const diff = pick([2, 4, 6, 10]);
    const sums = [20, 50, 100, 200, 300];
    const sum = sums[Math.min(Math.floor((level - 1) / 2), sums.length - 1)]!;
    const a = (sum + diff) / 2;
    const b = (sum - diff) / 2;
    const answer = diff * sum;
    return {
      type: "numeric",
      typeLabel: "זיהוי תבנית: הפרש ריבועים",
      groupLabel: "אלגברה · כפל מקוצר",
      text: `${a}² - ${b}² = ?`,
      answer,
      explanation: `תבנית הפרש ריבועים: a²-b² = (a-b)(a+b)\n(${a}-${b})(${a}+${b}) = ${diff} × ${sum} = ${answer}`,
    };
  }
  if (roll < 0.65) {
    const common = randInt(11, 49);
    const b = randInt(2, 8);
    const multiplier = level > 5 ? 20 : 10;
    const actualC = multiplier - b;
    const answer = common * multiplier;
    return {
      type: "numeric",
      typeLabel: "זיהוי תבנית: גורם משותף",
      groupLabel: "אלגברה · חוק הפילוג",
      text: `${common} × ${b} + ${common} × ${actualC} = ?`,
      answer,
      explanation: `הוצאת גורם משותף ${common}:\n${common} × (${b} + ${actualC}) = ${common} × ${multiplier} = ${answer}`,
    };
  }
  return generateCompareQuestion();
}

/* ============================== כפל ============================== */

function generateMultiplicationQuestion(level: number): RawQuestion {
  const a = randInt(11, 20 + level);
  const b = randInt(3, 6 + Math.floor(level / 2));
  const tens = a - (a % 10);
  const units = a % 10;
  return {
    type: "numeric",
    typeLabel: "כפל בעל פה",
    groupLabel: "חשבון · כפל",
    text: `${a} × ${b} = ?`,
    answer: a * b,
    explanation: `פירוק: ${a} = ${tens} + ${units}\n${tens}×${b}=${tens * b}, ${units}×${b}=${units * b}\nסה"כ: ${tens * b} + ${units * b} = ${a * b}`,
  };
}

/* ============================== חזקות ושורשים ============================== */

function generatePowersQuestion(level: number): RawQuestion {
  const r = Math.random();
  if (level <= 3) {
    const base = pick([2, 3, 4, 5, 6]);
    const exp = r < 0.5 ? 2 : 3;
    const ans = Math.pow(base, exp);
    return {
      type: "numeric",
      typeLabel: "חזקות בסיסיות",
      groupLabel: "חשבון · חזקות",
      text: `${base}^${exp} = ?`,
      answer: ans,
      explanation: `חזקה בסיסית: ${base}^${exp} = ${ans}`,
    };
  }
  if (r < 0.34) {
    const base = randInt(11, 19);
    return {
      type: "numeric",
      typeLabel: "ריבועים מוכרים",
      groupLabel: "חשבון · חזקות",
      text: `${base}² = ?`,
      answer: base * base,
      explanation: `${base}² = ${base}×${base} = ${base * base}`,
    };
  }
  if (r < 0.67) {
    const base = randInt(2, 7);
    return {
      type: "numeric",
      typeLabel: "חזקה שלישית",
      groupLabel: "חשבון · חזקות",
      text: `${base}³ = ?`,
      answer: base ** 3,
      explanation: `${base}³ = ${base}×${base}×${base} = ${base ** 3}`,
    };
  }
  const n = randInt(2, level > 6 ? 21 : 16);
  return {
    type: "numeric",
    typeLabel: "זיהוי שורש שלם",
    groupLabel: "חשבון · שורשים",
    text: `√${n * n} = ?`,
    answer: n,
    explanation: `${n}² = ${n * n}, ולכן √${n * n} = ${n}`,
  };
}

/* ============================== אחוזים ושברים ============================== */

const FRACTION_PERCENTS = [
  { frac: "1/2", pct: 50 },
  { frac: "1/4", pct: 25 },
  { frac: "3/4", pct: 75 },
  { frac: "1/5", pct: 20 },
  { frac: "2/5", pct: 40 },
  { frac: "1/10", pct: 10 },
] as const;

function generatePercentQuestion(level: number): RawQuestion {
  const r = Math.random();
  if (level <= 3 || r < 0.4) {
    const p = pick([5, 10, 15, 20, 25, 50, 75]);
    const base = randInt(2, 9) * 20;
    const ans = (p / 100) * base;
    return {
      type: "numeric",
      typeLabel: "חישוב אחוזים",
      groupLabel: "חשבון · אחוזים",
      text: `כמה הם ${p}% מתוך ${base}?`,
      answer: ans,
      explanation: `${p}% = ${p}/100. ${p}% מ-${base} = ${ans}`,
    };
  }
  if (r < 0.7) {
    const base = randInt(2, 9) * 20;
    const p = pick([10, 20, 25, 50]);
    const isIncrease = Math.random() < 0.5;
    const delta = (p / 100) * base;
    const ans = isIncrease ? base + delta : base - delta;
    return {
      type: "numeric",
      typeLabel: isIncrease ? "העלאת אחוזים" : "הנחת אחוזים",
      groupLabel: "חשבון · שינוי אחוזי",
      text: isIncrease
        ? `מספר ${base} גדל ב-${p}%. מה הערך החדש?`
        : `מחיר של ${base} ירד ב-${p}%. מה המחיר החדש?`,
      answer: ans,
      explanation: `${p}%×${base}=${delta}. ${isIncrease ? `${base}+${delta}=${ans}` : `${base}-${delta}=${ans}`}`,
    };
  }
  const f = pick(FRACTION_PERCENTS);
  return {
    type: "numeric",
    typeLabel: "המרה שבר לאחוז",
    groupLabel: "חשבון · שברים",
    text: `כמה אחוזים הם ${f.frac}?`,
    answer: f.pct,
    explanation: `${f.frac} = ${f.pct}/100 = ${f.pct}%`,
  };
}

/* ============================== בעיות מילוליות ============================== */

const WORK_COMBOS: ReadonlyArray<[number, number, number]> = [
  [4, 12, 3],
  [6, 12, 4],
  [3, 6, 2],
  [10, 15, 6],
  [12, 24, 8],
  [5, 20, 4],
];

function generateWordProblem(level: number): RawQuestion {
  const type = pick(level <= 3 ? [0, 3] : [0, 1, 2, 3]);
  if (type === 0) {
    const [a, b, t] = pick(WORK_COMBOS);
    return {
      type: "numeric",
      typeLabel: "בעיית עבודה",
      groupLabel: "בעיות מילוליות · קצב עבודה",
      text: `פועל א' מסיים משימה לבד ב-${a} שעות.\nפועל ב' מסיים אותה משימה לבד ב-${b} שעות.\nתוך כמה שעות יסיימו את המשימה יחד?`,
      answer: t,
      explanation: `קצב א': 1/${a} מהמשימה לשעה. קצב ב': 1/${b} לשעה.\nיחד: 1/${a}+1/${b}=1/${t}, ולכן הזמן המשותף הוא ${t} שעות.`,
    };
  }
  if (type === 1) {
    const t = randInt(2, 5);
    const v1 = 10 * randInt(3, 8);
    const v2 = 10 * randInt(3, 8);
    const d = (v1 + v2) * t;
    return {
      type: "numeric",
      typeLabel: "בעיית תנועה",
      groupLabel: "בעיות מילוליות · מהירות ומרחק",
      text: `שני רכבים יוצאים זה לקראת זה ממרחק ${d} ק"מ.\nמהירות הרכב הראשון ${v1} קמ"ש, מהירות הרכב השני ${v2} קמ"ש.\nכעבור כמה שעות ייפגשו?`,
      answer: t,
      explanation: `המרחק ביניהם נסגר בקצב ${v1}+${v2}=${v1 + v2} קמ"ש.\nזמן המפגש = ${d}/${v1 + v2} = ${t} שעות.`,
    };
  }
  if (type === 2) {
    const c1 = randInt(2, 9) * 10;
    const c2 = randInt(2, 9) * 10;
    return {
      type: "numeric",
      typeLabel: "בעיית תערובת",
      groupLabel: "בעיות מילוליות · תערובות",
      text: `מערבבים כמות שווה של תמיסה בריכוז ${c1}% עם תמיסה בריכוז ${c2}%.\nמה ריכוז התערובת המתקבלת (באחוזים)?`,
      answer: (c1 + c2) / 2,
      explanation: `בכמויות שוות, ריכוז התערובת הוא הממוצע: (${c1}+${c2})/2 = ${(c1 + c2) / 2}%`,
    };
  }
  const a = randInt(1, 4);
  const b = randInt(1, 4);
  const c = randInt(1, 4);
  const k = randInt(2, 7);
  const s = (a + b + c) * k;
  return {
    type: "numeric",
    typeLabel: "בעיית יחס וחלוקה",
    groupLabel: "בעיות מילוליות · יחסים",
    text: `מחלקים סכום של ${s} ש"ח בין שלושה אנשים ביחס ${a}:${b}:${c}.\nכמה מקבל האדם השלישי?`,
    answer: c * k,
    explanation: `סך החלקים: ${a}+${b}+${c}=${a + b + c}. כל חלק שווה ${s}/${a + b + c}=${k} ש"ח.\nהאדם השלישי מקבל ${c} חלקים = ${c}×${k} = ${c * k} ש"ח.`,
  };
}

/* ============================== גיאומטריה ============================== */

const PYTH_TRIPLES: ReadonlyArray<[number, number, number]> = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
];

const ANGLE_COMBOS = [
  { m: 2, third: 90, x: 30 },
  { m: 2, third: 60, x: 40 },
  { m: 3, third: 60, x: 30 },
  { m: 2, third: 30, x: 50 },
  { m: 4, third: 30, x: 30 },
] as const;

function generateGeometryQuestion(level: number): RawQuestion {
  const type = pick(level <= 3 ? [0, 2] : [0, 1, 2, 3]);
  if (type === 0) {
    const [legA, legB, hyp] = pick(PYTH_TRIPLES);
    const askHyp = Math.random() < 0.6;
    return {
      type: "numeric",
      typeLabel: "משפט פיתגורס",
      groupLabel: "גיאומטריה · משולשים",
      text: askHyp
        ? `במשולש ישר-זווית, אורכי הניצבים הם ${legA} ו-${legB}.\nמהו אורך היתר?`
        : `במשולש ישר-זווית, אורך היתר הוא ${hyp} ואורך אחד הניצבים ${legA}.\nמהו אורך הניצב השני?`,
      answer: askHyp ? hyp : legB,
      explanation: askHyp
        ? `משפט פיתגורס: ${legA}²+${legB}²=${legA * legA}+${legB * legB}=${hyp * hyp}=${hyp}²`
        : `משפט פיתגורס: ${hyp}²-${legA}²=${hyp * hyp}-${legA * legA}=${legB * legB}=${legB}²`,
    };
  }
  if (type === 1) {
    const combo = pick(ANGLE_COMBOS);
    const askSmall = Math.random() < 0.5;
    const small = combo.x;
    const big = combo.m * combo.x;
    return {
      type: "numeric",
      typeLabel: "סכום זוויות במשולש",
      groupLabel: "גיאומטריה · זוויות",
      text: `במשולש, זווית אחת גדולה פי ${combo.m} מזווית שנייה, והזווית השלישית שווה ל-${combo.third}°.\nמה גודל ${askSmall ? "הזווית הקטנה" : "הזווית הגדולה"}?`,
      answer: askSmall ? small : big,
      explanation: `סכום זוויות במשולש = 180°. x+${combo.m}x+${combo.third}=180 ⇒ x=${small}.\nהזווית הקטנה=${small}°, הגדולה=${big}°.`,
    };
  }
  if (type === 2) {
    const l = randInt(3, 14);
    const w = randInt(3, 14);
    const askArea = Math.random() < 0.5;
    return {
      type: "numeric",
      typeLabel: askArea ? "שטח מלבן" : "היקף מלבן",
      groupLabel: "גיאומטריה · שטחים והיקפים",
      text: `למלבן צלעות ${l} ו-${w}.\nמה ${askArea ? "השטח" : "ההיקף"} שלו?`,
      answer: askArea ? l * w : 2 * (l + w),
      explanation: askArea
        ? `שטח מלבן = אורך×רוחב = ${l}×${w} = ${l * w}`
        : `היקף מלבן = 2×(אורך+רוחב) = 2×(${l}+${w}) = ${2 * (l + w)}`,
    };
  }
  const base = 2 * randInt(2, 10);
  const height = randInt(2, 10);
  return {
    type: "numeric",
    typeLabel: "שטח משולש",
    groupLabel: "גיאומטריה · שטחים",
    text: `למשולש בסיס ${base} וגובה ${height}.\nמה שטחו?`,
    answer: (base * height) / 2,
    explanation: `שטח משולש = (בסיס×גובה)/2 = (${base}×${height})/2 = ${(base * height) / 2}`,
  };
}

/* ============================== הסתברות וקומבינטוריקה ============================== */

const NICE_FRACTIONS = [
  { num: 1, den: 2 },
  { num: 1, den: 4 },
  { num: 3, den: 4 },
  { num: 1, den: 5 },
  { num: 2, den: 5 },
  { num: 1, den: 10 },
  { num: 1, den: 20 },
  { num: 1, den: 25 },
] as const;

function factorial(x: number): number {
  let out = 1;
  for (let i = 2; i <= x; i++) out *= i;
  return out;
}

function generateProbabilityQuestion(level: number): RawQuestion {
  const type = pick(level <= 3 ? [0] : [0, 1, 2]);
  if (type === 0) {
    const f = pick(NICE_FRACTIONS);
    const k = randInt(1, 4);
    const total = f.den * k;
    const favorable = f.num * k;
    const percent = Math.round((favorable / total) * 100);
    return {
      type: "numeric",
      typeLabel: "הסתברות בסיסית",
      groupLabel: "הסתברות · שקית כדורים",
      text: `בשקית יש ${total} כדורים, מתוכם ${favorable} אדומים והשאר בצבעים אחרים.\nשולפים כדור אחד באקראי. מה ההסתברות (באחוזים) שהכדור אדום?`,
      answer: percent,
      explanation: `הסתברות = כדורים אדומים / סה"כ כדורים = ${favorable}/${total} = ${percent}%`,
    };
  }
  if (type === 1) {
    const n = randInt(3, 6);
    return {
      type: "numeric",
      typeLabel: "סידורים (עצרת)",
      groupLabel: "הסתברות · קומבינטוריקה",
      text: `בכמה דרכים שונות ניתן לסדר בשורה ${n} ילדים שונים?`,
      answer: factorial(n),
      explanation: `מספר הסידורים הוא ${n}! = ${Array.from({ length: n }, (_, i) => n - i).join("×")} = ${factorial(n)}`,
    };
  }
  const [n, r] = pick<[number, number]>([
    [4, 2],
    [5, 2],
    [6, 2],
    [5, 3],
    [6, 3],
    [4, 3],
  ]);
  const ans = factorial(n) / (factorial(r) * factorial(n - r));
  return {
    type: "numeric",
    typeLabel: "בחירת ועדה (צירופים)",
    groupLabel: "הסתברות · קומבינטוריקה",
    text: `בוחרים ועדה של ${r} אנשים מתוך ${n} מועמדים (הסדר אינו משנה).\nבכמה דרכים ניתן לבחור את הוועדה?`,
    answer: ans,
    explanation: `נוסחת הצירופים: C(${n},${r}) = ${n}!/(${r}!×${n - r}!) = ${ans}`,
  };
}

/* ============================== מנוע ============================== */

const RAW_GENERATORS: Record<CategoryKey, (level: number) => RawQuestion> = {
  algebra: generateAlgebraQuestion,
  multiplication: generateMultiplicationQuestion,
  powers: generatePowersQuestion,
  percentages: generatePercentQuestion,
  wordProblems: generateWordProblem,
  geometry: generateGeometryQuestion,
  probability: generateProbabilityQuestion,
};

/** בחירה אדפטיבית: קטגוריות עם דיוק נמוך (או מעט תרגול) מקבלות משקל גבוה יותר */
export function pickAdaptiveCategory(stats: StatsMap): CategoryKey {
  const weights = CATEGORY_KEYS.map((c) => {
    const s = stats[c];
    if (!s || s.attempts < 3) return 2.5;
    const accuracy = s.correct / s.attempts;
    return 0.3 + (1 - accuracy) * 2.2;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < CATEGORY_KEYS.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return CATEGORY_KEYS[i]!;
  }
  return CATEGORY_KEYS[CATEGORY_KEYS.length - 1]!;
}

function build(cat: CategoryKey, level: number): Question {
  const raw = RAW_GENERATORS[cat](level);
  return { ...raw, sourceCategory: cat, signature: `${cat}|${raw.text}` };
}

/**
 * מייצר שאלה חדשה ומנסה להימנע מחזרה על שאלות אחרונות.
 */
export function generateQuestion(
  mode: CategoryKey | "mixed",
  levels: Record<CategoryKey, number>,
  stats: StatsMap,
  recentSignatures: string[] = [],
): Question {
  for (let attempt = 0; attempt < 12; attempt++) {
    const cat = mode === "mixed" ? pickAdaptiveCategory(stats) : mode;
    const q = build(cat, levels[cat] ?? 1);
    if (!recentSignatures.includes(q.signature)) return q;
  }
  const cat = mode === "mixed" ? pickAdaptiveCategory(stats) : mode;
  return build(cat, levels[cat] ?? 1);
}

/** ניתוח קלט משתמש: תומך בעשרוני, פסיק עשרוני ומינוס */
export function parseUserAnswer(input: string): number | null {
  const cleaned = input.trim().replace(/,/g, ".").replace(/\s/g, "");
  if (!/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function isAnswerCorrect(input: string, expected: number): boolean {
  const parsed = parseUserAnswer(input);
  if (parsed === null) return false;
  return Math.abs(parsed - expected) < 1e-6;
}
