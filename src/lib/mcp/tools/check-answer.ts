import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { checkAgainstToken } from "../questions";

export default defineTool({
  name: "check_answer",
  title: "Check an answer",
  description:
    "Check a user's answer against a question produced by generate_question or generate_practice_set. Returns whether it is correct, the correct answer, and a Hebrew explanation.",
  inputSchema: {
    answer_token: z.string().min(1).describe("The answer_token returned with the question."),
    answer: z
      .string()
      .min(1)
      .describe("The user's answer: a number, or 0/1/2 for compare questions (A/B/equal)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: ({ answer_token, answer }) => {
    const result = checkAgainstToken(answer_token, answer);
    if (!result) {
      return {
        content: [{ type: "text", text: "answer_token לא תקין — הפיקי שאלה חדשה." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
