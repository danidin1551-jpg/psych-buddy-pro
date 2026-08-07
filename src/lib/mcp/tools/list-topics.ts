import { defineTool } from "@lovable.dev/mcp-js";
import { CATEGORY_KEYS, CATEGORY_META, type ModeKey } from "@/lib/psychomath/types";
import { stagesFor } from "@/lib/psychomath/skillTree";

export default defineTool({
  name: "list_topics",
  title: "List topics and skill stages",
  description:
    "List every available practice topic (key, Hebrew name, description) and the five skill-tree stages with their level ranges.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const keys: ModeKey[] = [...CATEGORY_KEYS, "mixed"];
    const result = {
      topics: keys.map((key) => ({
        key,
        name: CATEGORY_META[key].name,
        description: CATEGORY_META[key].description,
      })),
      levels: "1-10",
      stages: stagesFor(1).map((s) => ({
        index: s.index,
        name: s.name,
        min_level: s.minLevel,
        max_level: s.maxLevel,
      })),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
