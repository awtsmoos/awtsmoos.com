//B"H

export function normalizeRole(role) {
  if (role === "user") return "user";
  if (role === "model") return "assistant";
  if (role === "tool") return "tool";
  return "assistant";
}

export function visibleContentText(content = {}) {
  if (Array.isArray(content.parts)) return content.parts.map(partToText).filter(Boolean).join("\n");
  if (typeof content.text === "string") return content.text;
  return "";
}

export function extractVisibleText(message, input) {
  const content = message?.content || {};
  const text = visibleContentText(content);
  if (text) return text;
  if (typeof input?.text === "string" && !looksLikeTransport(input)) return input.text;
  return "";
}

export function extractEventText(input) {
  const message = input?.message || input?.input_message || input;
  return visibleContentText(message?.content || input?.content || input) || String(input?.text || "");
}

export function partToText(part) {
  if (typeof part === "string") return part;
  if (part?.text) return part.text;
  if (part?.summary) return part.summary;
  return "";
}

export function findFirstUrl(raw) {
  try { return JSON.stringify(raw).match(/https?:\/\/[^\s"')]+/)?.[0] || null; }
  catch { return null; }
}

function looksLikeTransport(input = {}) {
  return Boolean(input.data || input.event || input.dataNoJSON || input.type);
}
