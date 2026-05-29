//B"H
import { renderMarkdown } from "../markdown.js";

/**
 * Chapter 201: The Markdown Learned To Breathe While Still Being Born.
 *
 * Streaming keeps a stable raw pre-wrap actor and a stable markdown preview.
 * The preview is refreshed in place instead of replacing the whole bubble, so
 * CSS does not flash away and selection/scroll do not collapse during thought.
 */
export function updateLiveText(renderer, record, visibleText) {
  const bubble = record?.bubble;
  if (!bubble) return;
  const text = String(visibleText || "");
  bubble.dataset.markdown = "active";
  if (record.streaming) {
    bubble.classList.add("is-streaming-markdown");
    appendLiveDelta(bubble, text);
    renderLiveMarkdownPreview(bubble, text);
    return;
  }
  bubble.classList.remove("is-streaming-markdown");
  freezeMarkdownWhenSafe(bubble, text);
}

export function finalizeTextRecord(record) {
  if (!record) return;
  record.streaming = false;
  record.loading = false;
  record.streamEndedAt = Date.now();
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

function renderLiveMarkdownPreview(bubble, text) {
  const preview = ensureMarkdownPreview(bubble);
  const html = safeStreamingMarkdown(text);
  if (preview.dataset.liveHtml === html) return;
  preview.innerHTML = html;
  preview.dataset.liveHtml = html;
}

function safeStreamingMarkdown(text) {
  const safe = closeOpenFence(String(text || ""));
  return renderMarkdown(safe || " ");
}

function closeOpenFence(text) {
  const ticks = [...text.matchAll(/```/g)].length;
  return ticks % 2 ? `${text}\n\n\`\`\`` : text;
}

function ensureLiveActor(bubble) {
  let actor = bubble.querySelector(":scope > .message-live-text");
  if (actor) return actor;
  bubble.textContent = "";
  actor = document.createElement("span");
  actor.className = "message-live-text";
  actor.dataset ||= {};
  actor.dataset.liveText = "";
  bubble.append(actor);
  return actor;
}

function ensureMarkdownPreview(bubble) {
  let preview = bubble.querySelector(":scope > .message-live-markdown-preview");
  if (preview) return preview;
  preview = document.createElement("div");
  preview.className = "message-live-markdown-preview";
  preview.dataset ||= {};
  bubble.append(preview);
  return preview;
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
