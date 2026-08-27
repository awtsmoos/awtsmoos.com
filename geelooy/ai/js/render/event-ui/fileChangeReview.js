//B"H
import { escapeHtml } from "../escapeHtml.js";

/**
 * B"H
 * Chapter 347: The Changed Files Became A Review Shelf Of Sparks.
 *
 * Tool calls and tool results often describe the same write. The Codex shelf
 * must not double-count the same file just because the tunnel answered. Each
 * path becomes one vessel whose best known addition/removal numbers are kept.
 *
 * @param {object[]} events Tool group child events.
 * @returns {string} Review HTML or an empty string.
 */
export function renderFileChangeReview(events = []) {
  const changes = collectFileChanges(events);
  if (!changes.length) return "";
  const totals = changes.reduce((sum, item) => ({ plus: sum.plus + item.plus, minus: sum.minus + item.minus }), { plus: 0, minus: 0 });
  return `<section class="file-change-review tool-file-review">
    <div class="file-change-review-head"><b>Files changed</b><span>${changes.length} file${changes.length === 1 ? "" : "s"}</span><span class="diff-plus">+${totals.plus}</span><span class="diff-minus">-${totals.minus}</span></div>
    <div class="file-change-list">${changes.map(renderChange).join("")}</div>
  </section>`;
}

/**
 * @param {object[]} events Timeline tool events.
 * @returns {Array<{path:string,plus:number,minus:number,actions:Set<string>}>}
 */
export function collectFileChanges(events = []) {
  const byPath = new Map();
  for (const event of events) absorbEvent(byPath, event);
  return [...byPath.values()].filter(item => item.path);
}

function absorbEvent(byPath, event = {}) {
  const raw = event.raw || {};
  const action = actionName(raw, event);
  if (!isWriteLike(action)) return;
  const args = parseMaybeJson(raw.request || raw.call?.arguments || raw.call?.function?.arguments || {});
  const response = raw.response || {};
  for (const file of filesFrom(action, args, response)) mergeChange(byPath, file);
}

function filesFrom(action, args = {}, response = {}) {
  if (/bulk/i.test(action)) return bulkFiles(args, response);
  const path = first(args.p, args.path, response.path, response.absolutePath);
  const content = first(args.content, args.text, args.scriptText, args.html);
  return [{
    path,
    plus: lengthOf(content) || Number(response.bytes || response.totalBytes || 0),
    minus: Number(args.previousBytes || args.removedBytes || response.removedBytes || 0),
    action
  }];
}

function bulkFiles(args = {}, response = {}) {
  const writes = Array.isArray(args.writes) ? args.writes : Array.isArray(response.writes) ? response.writes : [];
  return writes.map(item => ({
    path: first(item.p, item.path),
    plus: lengthOf(first(item.content, item.text, item.scriptText, item.html)) || Number(item.bytes || 0),
    minus: Number(item.previousBytes || item.removedBytes || 0),
    action: "bulkWrite"
  }));
}

function mergeChange(byPath, file = {}) {
  if (!file.path) return;
  const old = byPath.get(file.path) || { path: file.path, plus: 0, minus: 0, actions: new Set() };
  old.plus = Math.max(old.plus, Number(file.plus || 0));
  old.minus = Math.max(old.minus, Number(file.minus || 0));
  old.actions.add(file.action || "write");
  byPath.set(file.path, old);
}

function renderChange(item) {
  return `<div class="file-change-row"><code class="file-change-path">${escapeHtml(item.path)}</code><span class="file-change-kind">${escapeHtml([...item.actions].join(", "))}</span><span class="file-change-stat diff-plus">+${item.plus}</span><span class="file-change-stat diff-minus">-${item.minus}</span></div>`;
}

function actionName(raw = {}, event = {}) {
  return String(raw.call?.name || raw.call?.function?.name || raw.request?.action || raw.response?.action || event.label || "");
}
function isWriteLike(action = "") { return /(^|\b)(write|bulkWrite|writeIfHash|bulkWriteIfHashes)(\b|$)/i.test(action); }
function first(...values) { return values.find(value => value !== undefined && value !== null && String(value) !== "") || ""; }
function lengthOf(value) { return typeof value === "string" ? value.length : 0; }
function parseMaybeJson(value) {
  if (typeof value !== "string") return value || {};
  try { return JSON.parse(value); } catch { return {}; }
}
