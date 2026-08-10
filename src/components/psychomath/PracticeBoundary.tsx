import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onReset: () => void;
}

interface State {
  hasError: boolean;
}

/** גבול שגיאה מקומי — שאלה פגומה לא מפילה את כל המסך */
export class PracticeBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("PracticeBoundary caught an error", error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset();
  };

  override render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-destructive bg-card p-8 text-center">
        <div className="text-lg font-bold">משהו השתבש בשאלה הזאת</div>
        <p className="text-sm text-muted-foreground">
          אפשר להמשיך לתרגל — נטען שאלה חדשה.
        </p>
        <button
          onClick={this.handleReset}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          נסי שוב
        </button>
      </div>
    );
  }
}
