//B"H
import { renderMarkdown } from "../markdown.js";

/**
 * Chapter 74: The Streaming Leaf Learned To Grow, Not Die.
 *
 * Finished message DOM must stand like a carved vessel. During a live response,
 * a hidden stable text actor keeps selection/tests safe, while a visible live
 * markdown preview renders the incoming answer as it streams.
 */
export function updateLiveText(renderer, record, visibleText) {
  const bubble = record?.bubble;
  if (!bubble) return;
  const text = String(visibleText || "");
  bubble.dataset.markdown = "active";
  if (record.streaming) {
    bubble.classList.add("is-streaming-markdown");
    appendLiveDelta(bubble, text);
    updateLiveMarkdownPreview(bubble, text);
    return;
  }
  bubble.classList.remove("is-streaming-markdown");
  removeLivePreview(bubble);
  freezeMarkdownWhenSafe(bubble, text);
}

/**
 * @param {object} record Message record.
 * @returns {void}
 */
export function finalizeTextRecord(record) {
  if (!record) return;
  record.streaming = false;
  record.loading = false;
  record.renderedText = null;
  record.renderedExpanded = null;
}

function appendLiveDelta(bubble, text) {
  const actor = ensureLiveActor(bubble);
  const previous = actor.dataset.liveText || "";
  if (text === previous) return;
  if (text.startsWith(previous)) {
    appendTextNode(actor, text.slice(previous.length));
    actor.dataset.liveText = text;
    return;
  }
  if (previous.startsWith(text) || previous.includes(text)) return;
  const overlap = longestSuffixPrefix(previous, text, 12000);
  if (overlap) {
    const healed = previous + text.slice(overlap);
    appendTextNode(actor, healed.slice(previous.length));
    actor.dataset.liveText = healed;
    return;
  }
  actor.textContent = text;
  actor.dataset.liveText = text;
}

function updateLiveMarkdownPreview(bubble, text) {
  const preview = ensureLivePreview(bubble);
  const html = renderMarkdown(text);
  if (preview.dataset.renderedMarkdown === html) return;
  preview.innerHTML = html;
  preview.dataset.renderedMarkdown = html;
}

function appendTextNode(actor, text) {
  if (!text) return;
  const node = document.createTextNode ? document.createTextNode(text) : { textContent: text };
  if (typeof actor.append === "function") actor.append(node);
  else actor.textContent = `${actor.textContent || ""}${node.textContent || ""}`;
}

function longestSuffixPrefix(left, right, max) {
  const limit = Math.min(max, left.length, right.length);
  for (let size = limit; size > 0; size--) if (left.slice(-size) === right.slice(0, size)) return size;
  return 0;
}

function ensureLiveActor(bubble) {
  let actor = bubble.querySelector(":scope > .message-live-text");
  if (actor) return actor;
  bubble.textContent = "";
  actor = document.createElement("span");
  actor.className = "message-live-text";
  actor.setAttribute?.("aria-hidden", "true");
  actor.dataset ||= {};
  actor.dataset.liveText = "";
  bubble.append(actor);
  return actor;
}

function ensureLivePreview(bubble) {
  let preview = bubble.querySelector(":scope > .message-live-markdown-preview");
  if (preview) return preview;
  preview = document.createElement("div");
  preview.className = "message-live-markdown-preview";
  preview.dataset ||= {};
  bubble.append(preview);
  return preview;
}

function removeLivePreview(bubble) {
  const preview = bubble.querySelector?.(":scope > .message-live-markdown-preview");
  preview?.remove?.();
}

function freezeMarkdownWhenSafe(bubble, text) {
  const html = renderMarkdown(text);
  if (bubble.dataset.frozenMarkdown === html) return;
  if (selectionTouches(bubble)) {
    bubble.dataset.pendingMarkdownHtml = html;
    bubble.classList.add("has-pending-markdown-freeze");
    installPendingFreezeGate(bubble);
    return;
  }
  bubble.innerHTML = html;
  bubble.dataset.frozenMarkdown = html;
  delete bubble.dataset.pendingMarkdownHtml;
  bubble.classList.remove("has-pending-markdown-freeze");
}

function installPendingFreezeGate(bubble) {
  if (bubble.dataset.pendingFreezeGate === "installed") return;
  bubble.dataset.pendingFreezeGate = "installed";
  document.addEventListener("selectionchange", () => {
    if (!bubble.isConnected || selectionTouches(bubble)) return;
    const html = bubble.dataset.pendingMarkdownHtml;
    if (!html) return;
    bubble.innerHTML = html;
    bubble.dataset.frozenMarkdown = html;
    delete bubble.dataset.pendingMarkdownHtml;
    bubble.classList.remove("has-pending-markdown-freeze");
  });
}

function selectionTouches(node) {
  try {
    const selection = globalThis.getSelection?.();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return false;
    for (let index = 0; index < selection.rangeCount; index++) {
      const range = selection.getRangeAt(index);
      if (range?.intersectsNode?.(node)) return true;
      if (node.contains?.(range.commonAncestorContainer)) return true;
    }
  } catch {}
  return false;
}
