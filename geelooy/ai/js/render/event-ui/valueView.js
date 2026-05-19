//B"H
import { escapeHtml } from "../escapeHtml.js";

export function valueView(value, depth = 0) {
  if (value === null || value === undefined) return `<span class="event-null">${value}</span>`;
  if (typeof value !== "object") return scalar(value);
  if (Array.isArray(value)) return arrayView(value, depth);
  return objectView(value, depth);
}

export function scalar(value) {
  const text = String(value);
  if (/^https?:\/\//.test(text)) return `<a href="${escapeHtml(text)}" target="_blank" rel="noreferrer">${escapeHtml(text)}</a>`;
  if (text.length > 320) return `<details class="event-long"><summary>${escapeHtml(text.slice(0, 120))}…</summary><div>${escapeHtml(text)}</div></details>`;
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
  return `<div class="event-field"><b>${escapeHtml(key)}</b><div>${valueView(value, depth + 1)}</div></div>`;
}
