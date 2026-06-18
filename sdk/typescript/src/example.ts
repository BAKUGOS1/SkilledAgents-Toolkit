import { Codex } from "@openai/codex-sdk";

const prompt =
  process.argv.slice(2).join(" ") ||
  "Inspect this repository and summarize the available skills and agents.";

const codex = new Codex();
const thread = codex.startThread();
const result = await thread.run(prompt);

console.log(result);

