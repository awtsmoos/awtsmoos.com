// B"H
/**
 * B"H
 * Chapter 158: The River Counted Its Own Letters Before It Flooded.
 *
 * MiniMax and every OpenAI-shaped river receives a trimmed context before the
 * request leaves the browser. The Awtsmoos lets memory remain alive, yet gives
 * the model permission to shed older husks when the vessel grows too full.
 */

/**
 * Estimates model tokens from message text.
 *
 * @param {string} text Any text-bearing vessel.
 * @returns {number} Approximate token count.
 */
export function estimateTokens(text = "") {
  const body = String(text || "");
  if (!body) return 0;
  return Math.max(1, Math.ceil(body.length / 4));
}

/**
 * Estimates all messages plus tool schema cost.
 *
 * @param {object[]} messages Chat messages.
 * @param {object[]} tools Tool schemas.
 * @returns {number} Approximate prompt token count.
 */
export function estimateRequestTokens(messages = [], tools = []) {
  const messageTokens = messages.reduce((sum, msg) => sum + estimateTokens(messageText(msg)) + 6, 0);
  const toolTokens = tools.length ? estimateTokens(JSON.stringify(tools)) : 0;
  return messageTokens + toolTokens + 12;
}

/**
 * Trims old conversation turns while preserving system and recent tool chains.
 *
 * @param {object[]} messages Provider messages.
 * @param {object[]} tools Tool schemas included in the request.
 * @param {number} limit Max context tokens.
 * @returns {{messages: object[], metrics: object}} Trimmed messages and metrics.
 */
export function trimMessagesForContext(messages = [], tools = [], limit = 128000) {
  const safeLimit = Math.max(4096, Number(limit || 128000));
  const reserved = Math.ceil(safeLimit * 0.18);
  const budget = Math.max(2048, safeLimit - reserved);
  const system = messages.filter(msg => msg.role === "system");
  const rest = messages.filter(msg => msg.role !== "system");
  const kept = [];
  for (let index = rest.length - 1; index >= 0; index--) {
    kept.unshift(rest[index]);
    const candidate = [...system, ...kept];
    if (estimateRequestTokens(candidate, tools) > budget) {
      kept.shift();
      break;
    }
  }
  const trimmed = [...system, ...healToolChains(kept)];
  const promptTokens = estimateRequestTokens(trimmed, tools);
  return {
    messages: trimmed,
    metrics: {
      contextWindow: safeLimit,
      promptTokens,
      availableTokens: Math.max(0, safeLimit - promptTokens),
      purgedMessages: Math.max(0, messages.length - trimmed.length),
      originalMessages: messages.length,
      keptMessages: trimmed.length
    }
  };
}

function healToolChains(messages = []) {
  const valid = new Set();
  const out = [];
  for (const msg of messages) {
    if (Array.isArray(msg.tool_calls)) msg.tool_calls.forEach(call => valid.add(call.id));
    if (msg.role === "tool" && !valid.has(msg.tool_call_id)) continue;
    out.push(msg);
  }
  return out;
}

function messageText(msg = {}) {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) return msg.content.map(part => part?.text || part?.content || "").join("\n");
  return JSON.stringify(msg.content || msg.tool_calls || "");
}
