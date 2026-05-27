//B"H
import { renderMarkdown } from "../markdown.js";

/**
 * Chapter 74: The Streaming Leaf Learned To Grow, Not Die.
 *
 * Finished message DOM must stand like a carved vessel. During a live response,
 * only the final mutable leaf receives new letters, and even that leaf grows by
 * appending text nodes instead of rewriting its full body. The Awtsmoos reveals
 * each spark without murdering the earlier sparks a reader may be selecting.
 *
 * @param {object} renderer Message renderer.
 * @param {object} record Message record.
 * @param {string} visibleText Text currently visible within length window.
 * @returns {void}
 */
export function updateLiveText(renderer, record, visibleText) {
  const bubble = record?.bubble;
  if (!bubble) return;
  const text = String(visibleText || "");
  bubble.dataset.markdown = "active";
  if (record.streaming) {
    bubble.classList.add("is-streaming-markdown");
    appendLiveDelta(bubble, text);
    return;
  }
  bubble.classList.remove("is-streaming-markdown");
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
    actor.append(document.createTextNode(text.slice(previous.length)));
  } else {
    actor.textContent = text;
  }
  actor.dataset.liveText = text;
}

function ensureLiveActor(bubble) {
  let actor = bubble.querySelector(":scope > .message-live-text");
  if (actor) return actor;
  bubble.textContent = "";
  actor = document.createElement("span");
  actor.className = "message-live-text";
  actor.dataset.liveText = "";
  bubble.append(actor);
  return actor;
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
