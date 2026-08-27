// B"H

const WRITE_ACTIONS = new Set(["write", "writeIfHash", "bulkWrite", "bulkWriteIfHashes"]);
const CONTENT_KEYS = new Set(["content", "text", "scriptText", "html"]);
const DEVTOOLS_GHOST = /^\s*<\s*(?:Author|script|anonymous|VM\d+|stdin|eval|anonymous code)\b[^\n\r]*$/i;
const THINK_TAG_LINE = /^\s*<\/?think>\s*$/i;

/**
 * B"H
 * Chapter 228: Before The File Was Written, The Ghost Line Was Burned Away.
 *
 * Some provider/browser paths can leak display metadata into generated source,
 * such as `<Author: anonymous` inside JavaScript. This purifier touches only
 * write-like tunnel calls and only whole content strings. It strips enclosing
 * markdown fences, provider thought tags, and known DevTools/source ghosts,
 * while preserving the user's real code as a complete file body.
 *
 * @param {string} action Awtsmoos action name.
 * @param {object} args Tool arguments about to be sent to the local tunnel.
 * @returns {{args:object,warnings:string[]}} Sanitized args plus warnings.
 */
export function sanitizeToolArguments(action = "", args = {}) {
  if (!WRITE_ACTIONS.has(String(action))) return { args, warnings: [] };
  const warnings = [];
  const cleanArgs = sanitizeValue(args, warnings);
  return { args: cleanArgs, warnings };
}

function sanitizeValue(value, warnings) {
  if (Array.isArray(value)) return value.map(item => sanitizeValue(item, warnings));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === "string" && CONTENT_KEYS.has(key)) out[key] = sanitizeContent(child, warnings);
    else out[key] = sanitizeValue(child, warnings);
  }
  return out;
}

export function sanitizeContent(content = "", warnings = []) {
  const unfenced = stripOuterFence(String(content || ""), warnings);
  const lines = unfenced.split(/\r?\n/);
  const kept = [];
  for (const line of lines) {
    if (DEVTOOLS_GHOST.test(line)) { warnings.push(`removed devtools/source ghost: ${line.trim().slice(0, 80)}`); continue; }
    if (THINK_TAG_LINE.test(line)) { warnings.push("removed stray think tag line"); continue; }
    kept.push(line);
  }
  return kept.join("\n");
}

function stripOuterFence(text, warnings) {
  const trimmed = text.trim();
  const match = /^```[\w.-]*\s*\n([\s\S]*?)\n```\s*$/.exec(trimmed);
  if (!match) return text;
  warnings.push("removed enclosing markdown code fence from write content");
  return match[1];
}
