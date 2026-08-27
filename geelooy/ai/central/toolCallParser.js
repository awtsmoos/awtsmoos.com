// B"H

/**
 * B"H
 * Chapter 25: The silent model carved tools into plain text.
 *
 * Some models will not emit native `tool_calls`. The Awtsmoos therefore gives
 * them a second road: a JSON block containing `awtsmoos_tool_calls`. This file
 * extracts both fenced and raw JSON without trusting prose as code.
 */
export function parseFallbackToolCalls(text = "") {
  const found = [];
  for (const source of candidateJsonTexts(text)) {
    try {
      const json = JSON.parse(source);
      const list = json.awtsmoos_tool_calls || json.tool_calls || [];
      if (Array.isArray(list)) found.push(...list.map(normalizeTextToolCall));
    } catch (_) {}
  }
  return found.filter(call => call.name);
}

/**
 * B"H
 * Extracts possible JSON bodies from fenced blocks and whole text.
 *
 * @param {string} text Model response text.
 * @returns {string[]} Candidate JSON strings.
 */
export function candidateJsonTexts(text = "") {
  const body = String(text || "");
  const fenced = [...body.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map(match => match[1].trim());
  return [...fenced, body.trim()].filter(Boolean);
}

/**
 * B"H
 * Normalizes fallback tool call shape.
 *
 * @param {object} call Raw call.
 * @returns {object} Canonical call.
 */
export function normalizeTextToolCall(call = {}) {
  return {
    id: call.id || `text-call-${Math.random().toString(36).slice(2)}`,
    name: call.name || call.function?.name || call.tool,
    arguments: typeof call.arguments === "string" ? safeJson(call.arguments) : (call.arguments || call.args || {})
  };
}

function safeJson(value) {
  try { return JSON.parse(value); } catch (_) { return {}; }
}

/**
 * B"H
 * Normalizes native OpenAI-compatible tool calls.
 *
 * @param {object[]} toolCalls Native tool_calls array.
 * @returns {object[]} Canonical calls.
 */
export function normalizeNativeToolCalls(toolCalls = []) {
  return toolCalls.map(call => ({
    id: call.id || `native-call-${Math.random().toString(36).slice(2)}`,
    name: call.function?.name || call.name,
    arguments: safeJson(call.function?.arguments || call.arguments || "{}")
  })).filter(call => call.name);
}
