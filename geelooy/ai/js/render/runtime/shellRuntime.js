//B"H
import { renderEventRegion, visibleRenderableEvents } from "./eventRuntime.js";
import { VISIBLE_TEXT_LIMIT } from "./renderConstants.js";
import { dedupeEvents } from "./renderHelpers.js";
import { primaryRecordKind, recordKinds } from "./recordWeight.js";
import { updateLiveText } from "./liveTextRuntime.js";
import { toolHeadline } from "../event-ui/toolHeadline.js";

/**
 * Chapter 53: The Shell Held Still While Letters Fell.
 *
 * The message shell is a stable vessel. It may receive text, event chambers,
 * and loading sparks, but it must not reorder its inner reality wildly while
 * the stream is alive.
 *
 * @param {object} renderer Message renderer.
 * @param {object} record Message record.
 * @returns {HTMLElement} Message shell.
 */
export function createShell(renderer, record) {
  const shell = document.createElement("div");
  const kind = primaryRecordKind(record);
  shell.className = `message-shell ${record.role === "user" ? "end-flow" : "start-flow"} kind-${kind} ${record.text ? "has-text" : "event-only"}`;
  shell.dataset.messageId = record.id;
  shell.dataset.eventKinds = recordKinds(record).join(" ");
  record.shell = shell;
  const visible = visibleRenderableEvents(dedupeEvents(record.events || []));
  if (!record.text && !record.loading && !visible.length) {
    shell.classList.add("is-render-suppressed");
    return shell;
  }
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

function activeEventLabel(record) {
  const events = record.events || [];
  const activeTool = [...events].reverse().find(event => /tool|awtsmoos/i.test(event.kind || ""));
  if (activeTool) {
    const info = toolHeadline(activeTool);
    const target = info.target && info.target !== info.action ? ` · ${info.target}` : "";
    return `Running: ${info.action}${target}`;
  }
  const kinds = recordKinds(record);
  if (kinds.includes("thinking")) return "Thinking trace";
  if (kinds.includes("status")) return "Status trace";
  return "Transport trace";
}
