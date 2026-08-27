//B"H
import { escapeHtml } from "../escapeHtml.js";
import { highlightedCode, languageFromPath } from "./codeHighlight.js";

export function valueView(value, depth = 0, key = "") {
  if (value === null || value === undefined) return `<span class="event-null">${value}</span>`;
  if (typeof value !== "object") return scalar(value, key);
  if (Array.isArray(value)) return arrayView(value, depth);
  return objectView(value, depth);
}

/**
 * Chapter 4: The Long Word Became a River of Fire.
 *
 * The Awtsmoos lets every scalar choose its vessel: URLs become gates, short
 * sparks stay inline, and code-shaped floods receive a scroll of monospace
 * clarity instead of suffocating inside a pill.
 *
 * @param {unknown} value Primitive value to render.
 * @param {string} key Field name used to infer language/meaning.
 * @returns {string} Safe HTML for the primitive vessel.
 */
export function scalar(value, key = "") {
  const text = String(value);
  if (/^https?:\/\//.test(text)) return `<a href="${escapeHtml(text)}" target="_blank" rel="noreferrer">${escapeHtml(text)}</a>`;
  if (shouldRenderCode(text, key)) return codeBlock(text, languageFor(key, text));
  if (text.length > 320) return `<details class="event-long"><summary>${escapeHtml(text.slice(0, 120))}…</summary>${codeBlock(text, languageFor(key, text))}</details>`;
  return `<span>${escapeHtml(text)}</span>`;
}

function objectView(obj, depth) {
  const rows = Object.entries(obj || {}).map(([key, value]) => row(key, value, depth)).join("");
  if (!rows) return `<span class="event-empty">empty object</span>`;
  if (depth > 1) return `<details class="event-object"><summary>${Object.keys(obj).length} fields</summary>${rows}</details>`;
  return `<div class="event-object">${rows}</div>`;
}

function arrayView(items, depth) {
  if (!items.length) return `<span class="event-empty">empty list</span>`;
  const body = items.map((item, index) => row(`#${index + 1}`, item, depth)).join("");
  return `<details class="event-array" ${depth < 1 ? "open" : ""}><summary>${items.length} item(s)</summary>${body}</details>`;
}

function row(key, value, depth) {
  return `<div class="event-field"><b>${escapeHtml(key)}</b><div>${valueView(value, depth + 1, key)}</div></div>`;
}

function codeBlock(text, language) {
  const resolved = languageFromPath(language) || language;
  return `<pre class="event-code-block language-${escapeHtml(resolved)}"><code>${highlightedCode(text, resolved)}</code></pre>`;
}

function shouldRenderCode(text, key = "") {
  if (text.length > 700) return true;
  if (/content|code|script|json|payload|body|input|output|result|request|response/i.test(key)) return text.length > 80;
  return /^[\s\[{]|function\s|export\s|import\s|const\s|let\s|class\s|\/\/B\"H/.test(text);
}

function languageFor(key = "", text = "") {
  if (/json|payload|body|request|response|result/i.test(key) || /^[\s\r\n]*[\[{]/.test(text)) return "json";
  if (/html/i.test(key) || /^\s*</.test(text)) return "html";
  if (/css|style/i.test(key)) return "css";
  if (/js|script|code|content/i.test(key) || /\b(export|import|function|const|let|class)\b/.test(text)) return "javascript";
  return "text";
}
