import { useEffect, useMemo, useState } from "react";
import { prefersReducedMotion } from "@/lib/psychomath/feedback";

interface Props {
  /** משתנה בכל פעם שצריך לפרוץ קונפטי; 0 = בלי */
  trigger: number;
}

const COLORS = [
  "var(--brand-coral)",
  "var(--brand-lime)",
  "var(--brand-violet)",
  "var(--primary)",
];

export function Confetti({ trigger }: Props) {
  const [show, setShow] = useState(false);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    if (!trigger || reduced) return;
    setShow(true);
    const id = window.setTimeout(() => setShow(false), 1300);
    return () => window.clearTimeout(id);
  }, [trigger, reduced]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${(i * 5.5 + ((i * 37) % 9)) % 100}%`,
        delay: `${(i % 6) * 60}ms`,
        color: COLORS[i % COLORS.length]!,
        drift: `${((i % 5) - 2) * 18}px`,
      })),
    [],
  );

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 block h-2 w-1.5 rounded-[1px]"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            ["--drift" as string]: p.drift,
          }}
        />
      ))}
    </div>
  );
}
