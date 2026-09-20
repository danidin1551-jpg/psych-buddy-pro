export type QuestionContentPart =
  | { type: "text"; value: string }
  | { type: "math"; value: string };

export type QuestionContent = QuestionContentPart[];

export interface QuestionSource {
  sourceType: "official_nite" | "user_provided" | "original_psychomath";
  sourceOrganization?: string;
  sourceId?: string;
  examDate?: string;
  section?: "quantitative" | "verbal" | "english";
  questionNumber?: number;
  permissionStatus: "public_educational" | "permission_granted" | "personal_only" | "unverified";
  verified: boolean;
}

export function contentFromText(text: string): QuestionContent {
  return [{ type: "text", value: text }];
}
