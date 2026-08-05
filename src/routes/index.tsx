import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "@/components/psychomath/HomeScreen";
import { PracticeScreen } from "@/components/psychomath/PracticeScreen";
import { PathScreen } from "@/components/psychomath/PathScreen";
import { StatsScreen } from "@/components/psychomath/StatsScreen";

import { SummaryScreen } from "@/components/psychomath/SummaryScreen";
import { EXAM_LENGTH, usePsychoMath } from "@/hooks/usePsychoMath";

const TITLE = "PsychoMath — תרגול חשיבה כמותית לפסיכומטרי";
const DESCRIPTION =
  "אימון חישוב מנטלי לפסיכומטרי: אלגברה, אחוזים, בעיות מילוליות, גיאומטריה והסתברות, עם רמה אדפטיבית, סימולציה מתוזמנת וחזרה על טעויות.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const app = usePsychoMath();

  const progressLabel =
    app.session.kind === "exam"
      ? `שאלה ${Math.min(app.session.answered + 1, EXAM_LENGTH)} מתוך ${EXAM_LENGTH}`
      : app.session.kind === "review"
        ? "מצב חזרה על טעויות"
        : app.session.kind === "fix"
          ? "סבב תיקון"
          : app.session.kind === "timed"
            ? `מנה קצרה · ${app.session.answered} שאלות עד כה`
            : `נענו ${app.session.answered} שאלות בסבב הזה`;

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
        {app.screen === "home" && (
          <HomeScreen
            onStart={app.startPractice}
            onShowStats={() => app.setScreen("stats")}
            onShowPath={() => app.setScreen("path")}
            onReview={app.startReview}
            missedCount={app.missed.length}
            bestStreak={app.bestStreak}
            dayStreak={app.dayStreak}
            dayStreakValue={app.dayStreakValue}
            practicedToday={app.practicedToday}
            muted={app.muted}
            onToggleMuted={app.toggleMuted}
          />
        )}

        {app.screen === "path" && (
          <PathScreen
            levels={app.levels}
            stats={app.stats}
            onStartCategory={(cat) => app.startPractice(cat, "timed", 3)}
            onBack={app.goHome}
          />
        )}

        {app.screen === "practice" && app.question && (
          <PracticeScreen
            question={app.question}
            userInput={app.userInput}
            feedback={app.feedback}
            streak={app.streak}
            progressLabel={progressLabel}
            remainingMs={app.remainingMs}
            totalMs={app.session.durationMs}
            levelUp={app.levelUpFlash !== null}
            onKeypad={app.handleKeypad}
            onSubmitNumeric={app.submitNumeric}
            onSubmitCompare={app.submitCompare}
            onNext={app.nextQuestion}
            onBack={() =>
              app.session.kind === "endless" ? app.goHome() : app.finishSession()
            }
          />
        )}

        {app.screen === "stats" && (
          <StatsScreen
            stats={app.stats}
            levels={app.levels}
            onBack={app.goHome}
            onReset={app.resetStats}
          />
        )}

        {app.screen === "summary" && (
          <SummaryScreen
            answered={app.session.answered}
            correct={app.session.correct}
            totalTime={app.session.totalTime}
            missed={app.session.missed}
            onFixRound={app.session.kind === "fix" ? undefined : app.startFixRound}
            onRestart={() =>
              app.startPractice(
                app.mode,
                app.session.kind === "review" || app.session.kind === "fix"
                  ? "endless"
                  : app.session.kind,
                app.session.durationMs ? app.session.durationMs / 60_000 : undefined,
              )
            }
            onHome={app.goHome}
          />
        )}
      </main>
    </div>
  );
}

