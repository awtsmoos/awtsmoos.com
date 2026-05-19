//B"H
import { renderMarkdown } from "../markdown.js";
import { renderEventRegion } from "./eventRuntime.js";
import { VISIBLE_TEXT_LIMIT } from "./renderConstants.js";
import { dedupeEvents } from "./renderHelpers.js";

export function createShell(renderer, record) {
  const shell = document.createElement("div");
  shell.className = `message-shell ${record.role === "user" ? "end-flow" : "start-flow"}`;
  shell.dataset.messageId = record.id;
  record.shell = shell;
  if (record.text) shell.append(createCombinedBubble(renderer, record));
  if (record.loading && !record.text) shell.append(loadingBubble());
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

export function createInlineOverflow(renderer, record, hiddenCount) {
  const wrap = document.createElement("div");
  wrap.className = "inline-overflow-note";
  const show = document.createElement("button");
  show.className = "inline-overflow-button";
  show.textContent = `Show ${hiddenCount.toLocaleString()} more characters`;
  show.onclick = () => {
    record.expanded = true;
    renderer.refreshLive(record);
    renderer.scrollDown();
  };
  wrap.append(show);
  return wrap;
}

export function loadingBubble() {
  const bubble = document.createElement("div");
  bubble.className = "message assistant is-loading";
  bubble.innerHTML = `<div class="message-loading"><i></i><span></span><span></span><span></span><em>streaming…</em></div>`;
  return bubble;
}
