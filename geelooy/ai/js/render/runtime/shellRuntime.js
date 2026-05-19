//B"H
import { renderMarkdown } from "../markdown.js";
import { renderEventRegion } from "./eventRuntime.js";
import { VISIBLE_TEXT_LIMIT } from "./renderConstants.js";
import { dedupeEvents } from "./renderHelpers.js";
import { primaryRecordKind, recordKinds } from "./recordWeight.js";

export function createShell(renderer, record) {
  const shell = document.createElement("div");
  const kind = primaryRecordKind(record);
  shell.className = `message-shell ${record.role === "user" ? "end-flow" : "start-flow"} kind-${kind} ${record.text ? "has-text" : "event-only"}`;
  shell.dataset.messageId = record.id;
  shell.dataset.eventKinds = recordKinds(record).join(" ");
  record.shell = shell;
  if (!record.text && record.events?.length) shell.append(eventBadge(record));
  if (record.text) shell.append(createCombinedBubble(renderer, record));
  if (record.loading && !record.text && !record.events?.length) shell.append(loadingBubble());
  const cleanEvents = dedupeEvents(record.events || []);
  if (cleanEvents.length) renderEventRegion(shell, cleanEvents, record);
  return shell;
}

export function createCombinedBubble(renderer, record) {
  const bubble = document.createElement("div");
  bubble.className = `message ${record.role}`;
  record.bubble = bubble;
  updateBubbleHtml(renderer, record);
  return bubble;
}

export function updateBubbleHtml(renderer, record) {
  if (!record.bubble) return;
  const text = String(record.text || "");
  const tooLong = text.length > VISIBLE_TEXT_LIMIT && !record.expanded;
  const visibleText = tooLong ? text.slice(0, VISIBLE_TEXT_LIMIT) : text;
  if (record.renderedText === visibleText && record.renderedExpanded === record.expanded) return;
  record.bubble.innerHTML = renderMarkdown(visibleText);
  record.renderedText = visibleText;
  record.renderedExpanded = record.expanded;
  if (tooLong) record.bubble.append(createInlineOverflow(renderer, record, text.length - visibleText.length));
}

export function eventBadge(record) {
  const kinds = recordKinds(record);
  const label = kinds.includes("thinking") ? "Thinking trace" : kinds.includes("tool_call") ? "Tool call" : kinds.includes("tool_result") ? "Tool result" : kinds.includes("status") ? "Status trace" : "Transport trace";
  const badge = document.createElement("div");
  badge.className = "event-record-badge";
  badge.textContent = label;
  return badge;
}

export function createInlineOverflow(renderer, record, hiddenCount) {
  const wrap = document.createElement("div");
  wrap.className = "inline-overflow-note";
  const show = document.createElement("button");
  show.className = "inline-overflow-button";
  show.textContent = `Show ${hiddenCount.toLocaleString()} more characters`;
  show.onclick = () => { record.expanded = true; renderer.refreshLive(record); renderer.scrollDown(); };
  wrap.append(show);
  return wrap;
}

export function loadingBubble() {
  const bubble = document.createElement("div");
  bubble.className = "message assistant is-loading extreme-loading";
  bubble.innerHTML = `<div class="message-loading"><i></i><span></span><span></span><span></span><em>incoming sparks…</em></div>`;
  return bubble;
}
