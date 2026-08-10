interface Props {
  /** 0 → 1, נגזר מהקומבו החי */
  intensity?: number;
  className?: string;
}

/**
 * "כדור אורורה" — כתם mesh-gradient מטושטש שנע לאט ברקע.
 * שכבת הבסיס תמיד פעילה; מהירות הסיבוב והרוויה מואצות לפי --combo-intensity.
 * ב-prefers-reduced-motion ה-CSS עוצר את התנועה ומשאיר גרסה סטטית צבעונית.
 */
export function AuroraOrb({ intensity = 0, className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`aurora-orb ${className}`}
      style={{ "--combo-intensity": Math.min(1, Math.max(0, intensity)) } as React.CSSProperties}
    />
  );
}
