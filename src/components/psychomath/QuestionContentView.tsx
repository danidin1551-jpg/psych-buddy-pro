import type { QuestionContent } from "@/lib/psychomath/content";

interface Props {
  content: QuestionContent;
  className?: string;
}

export function QuestionContentView({ content, className = "" }: Props) {
  return (
    <div className={className}>
      {content.map((part, index) =>
        part.type === "math" ? (
          <span
            key={index}
            dir="ltr"
            className="mx-1 inline-block whitespace-nowrap font-serif text-[1.05em] tracking-wide"
            aria-label={part.value}
          >
            {part.value}
          </span>
        ) : (
          <span key={index} dir="auto">
            {part.value}
          </span>
        ),
      )}
    </div>
  );
}
