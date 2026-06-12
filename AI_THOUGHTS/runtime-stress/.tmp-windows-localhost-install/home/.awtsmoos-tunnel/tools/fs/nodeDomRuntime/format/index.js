// B"H
const { toYaml } = require("./yaml.js");
const { toOpenAiToolResult } = require("./openai.js");

function applyFormat(result, format) {
  const wanted = String(format || "json").toLowerCase();
  if (["yaml", "yml"].includes(wanted)) return { ok: result.ok, engine: result.engine, format: "yaml", content: toYaml(publicSummary(result)), result };
  if (["openai", "openai-tool", "tool"].includes(wanted)) return toOpenAiToolResult(result);
  return result;
}
function publicSummary(r) {
  return { ok: r.ok, engine: r.engine, score: r.score, entry: r.entry, values: r.values, errors: r.errors, capabilities: r.capabilities, interactionLog: r.interactionLog };
}
module.exports = { applyFormat };
