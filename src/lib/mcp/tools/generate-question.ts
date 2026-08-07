import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CATEGORY_KEYS } from "@/lib/psychomath/types";
import { makeQuestion } from "../questions";

const topics = [...CATEGORY_KEYS, "mixed"] as const;

export default defineTool({
  name: "generate_question",
  title: "Generate a practice question",
  description:
    "Generate one Hebrew psychometric (quantitative reasoning) practice question for a topic and difficulty level. Returns the question text plus an opaque answer_token to pass to check_answer.",
  inputSchema: {
    topic: z
      .enum(topics)
      .describe("Topic key. Use list_topics for the catalog. 'mixed' picks adaptively."),
    level: z.number().int().min(1).max(10).describe("Difficulty level, 1 (easiest) to 10."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: ({ topic, level }) => {
    const { public: q } = makeQuestion(topic, level);
    return {
      content: [{ type: "text", text: JSON.stringify(q, null, 2) }],
      structuredContent: q,
    };
  },
});
