import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CATEGORY_KEYS } from "@/lib/psychomath/types";
import { makeQuestion } from "../questions";

const topics = [...CATEGORY_KEYS, "mixed"] as const;

export default defineTool({
  name: "generate_practice_set",
  title: "Generate a practice set",
  description:
    "Generate a short practice session of several Hebrew psychometric questions, avoiding repeats within the set.",
  inputSchema: {
    topic: z.enum(topics).describe("Topic key, or 'mixed' for a varied set."),
    level: z.number().int().min(1).max(10).describe("Difficulty level, 1 to 10."),
    count: z.number().int().min(1).max(20).describe("How many questions to generate (1-20)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: ({ topic, level, count }) => {
    const recent: string[] = [];
    const questions = [];
    for (let i = 0; i < count; i++) {
      const { question, public: q } = makeQuestion(topic, level, recent);
      recent.push(question.signature);
      questions.push(q);
    }
    const result = { topic, level, count: questions.length, questions };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
