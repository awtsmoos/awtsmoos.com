//B"H
import { renderEventRegion, visibleRenderableEvents } from "./eventRuntime.js";
import { VISIBLE_TEXT_LIMIT } from "./renderConstants.js";
import { dedupeEvents } from "./renderHelpers.js";
import { primaryRecordKind, recordKinds } from "./recordWeight.js";
import { updateLiveText } from "./liveTextRuntime.js";
import { ensureStreamStatus, removeStreamStatus } from "./streamStatsRuntime.js";
import { toolHeadline } from "../event-ui/toolHeadline.js";

/**
 * Chapter 203: The Stream Rail Refused To Be Erased By Falling Letters.
 *
 * Every bubble refresh now also refreshes the independent stream status rail.
 * The rail is never inside the markdown preview, so parsing live markdown cannot
 * delete elapsed seconds, token count, or progress width.
 */
export function createShell(renderer, record) {
  const shell = document.createElement("div");
  const kind = primaryRecordKind(record);
  shell.className = `message-shell ${record.role === "user" ? "end-flow" : "start-flow"} kind-${kind} ${record.text ? "has-text" : "event-only"} ${record.streaming || record.loading ? "is-live" : "is-finished"}`;
  shell.dataset.messageId = record.id;
  shell.dataset.eventKinds = recordKinds(record).join(" ");
  record.shell = shell;
  const visible = visibleRenderableEvents(dedupeEvents(record.events || []));
  if (!record.text && !record.loading && !visible.length) {
    shell.classList.add("is-render-suppressed");
    return shell;
  }
  refreshStreamRail(record);
  if (!record.text && visible.length) shell.append(eventBadge({ ...record, events: visible }));
  if (visible.length) renderEventRegion(shell, visible, record);
  if (record.text) shell.append(createCombinedBubble(renderer, record));
  if (record.loading && !record.text && !visible.length) shell.append(loadingBubble());
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
  refreshStreamRail(record);
  if (!record.bubble) return;
  const text = String(record.text || "");
  const tooLong = text.length > VISIBLE_TEXT_LIMIT && !record.expanded;
  const visibleText = tooLong ? text.slice(0, VISIBLE_TEXT_LIMIT) : text;
  if (record.renderedText === visibleText && record.renderedExpanded === record.expanded && record.renderedStreaming === record.streaming) return;
  updateLiveText(renderer, record, visibleText);
  record.renderedText = visibleText;
  record.renderedExpanded = record.expanded;
  record.renderedStreaming = record.streaming;
  if (tooLong) record.bubble.append(createInlineOverflow(renderer, record, text.length - visibleText.length));
}

export function refreshEventBadge(record) {
  const badge = record.shell?.querySelector?.(":scope > .event-record-badge");
  if (badge) badge.textContent = activeEventLabel(record);
  refreshStreamRail(record);
}

export function eventBadge(record) {
  const label = activeEventLabel(record);
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

function refreshStreamRail(record) {
  if (!record?.shell) return;
  if (record.streaming || record.loading) ensureStreamStatus(record.shell, record);
  else removeStreamStatus(record.shell);
}

function activeEventLabel(record) {
  const events = record.events || [];
  const activeTool = [...events].reverse().find(event => /tool|awtsmoos/i.test(event.kind || ""));
  if (activeTool) {
    const info = toolHeadline(activeTool);
    const target = info.target && info.target !== info.action ? ` · ${info.target}` : "";
    const prefix = record.streaming || record.loading ? "Running" : "Tool trace";
    return `${prefix}: ${info.action}${target}`;
  }
  const kinds = recordKinds(record);
  if (kinds.includes("thinking")) return record.streaming || record.loading ? "Thinking live…" : "Thinking trace";
  if (kinds.includes("status")) return record.streaming || record.loading ? "Status streaming…" : "Status trace";
  return record.streaming || record.loading ? "Transport streaming…" : "Transport trace";
}
