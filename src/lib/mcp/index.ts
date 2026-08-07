import { defineMcp } from "@lovable.dev/mcp-js";
import generateQuestionTool from "./tools/generate-question";
import generatePracticeSetTool from "./tools/generate-practice-set";
import checkAnswerTool from "./tools/check-answer";
import listTopicsTool from "./tools/list-topics";

export default defineMcp({
  name: "psychometric-practice-pal",
  title: "Psychometric Practice Pal",
  version: "0.1.0",
  instructions:
    "Hebrew psychometric (Israeli PET) quantitative-reasoning practice tools. Call list_topics for the topic catalog, generate_question or generate_practice_set to create questions, then check_answer with the question's answer_token to grade the answer and get a Hebrew explanation. No personal data is stored or exposed.",
  tools: [listTopicsTool, generateQuestionTool, generatePracticeSetTool, checkAnswerTool],
});
