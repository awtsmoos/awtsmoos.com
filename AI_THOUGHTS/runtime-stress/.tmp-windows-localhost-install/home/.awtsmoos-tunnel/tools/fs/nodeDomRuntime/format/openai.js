// B"H
/** B"H: OpenAI-tool-call-friendly result envelope. */
function toOpenAiToolResult(result) {
  return {
    ok: result.ok,
    type: "tool_result",
    action: "simulateRuntime",
    engine: result.engine,
    output_text: summaryText(result),
    structuredContent: compact(result)
  };
}
function summaryText(r) {
  const status = r.ok ? "passed" : "failed";
  return `simulateRuntime ${status} with engine=${r.engine}; score=${r.score}; errors=${(r.errors || []).length}`;
}
function compact(r) {
  return { ok: r.ok, engine: r.engine, score: r.score, entry: r.entry, values: r.values, errors: r.errors, capabilities: r.capabilities, interactionLog: r.interactionLog };
}
module.exports = { toOpenAiToolResult };
