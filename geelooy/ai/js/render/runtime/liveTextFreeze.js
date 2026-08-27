//B"H
import { renderMarkdown } from "../markdown.js";

/**
 * Chapter 76: The Final Word Became Carved Light.
 *
 * Only after the stream stops does the plain river harden into markdown stone.
 * Until then the main thread does not mine, polish, repaint, and rehang the
 * same mountain each breath; when silence lands, the Awtsmoos shapes one final
 * vessel from the complete text.
 *
 * @param {HTMLElement} bubble Message bubble.
 * @param {string} text Complete message text.
 * @returns {void}
 * @sideEffects Replaces live text with final markdown when selection is safe.
 */
export function freezeMarkdownWhenSafe(bubble, text) {
  const html = renderMarkdown(String(text || ""));
  if (bubble.dataset.frozenMarkdown === html) return;
  if (selectionTouches(bubble)) return deferFreezeUntilSelectionLeaves(bubble, html);
  installFrozenHtml(bubble, html);
}

function deferFreezeUntilSelectionLeaves(bubble, html) {
  bubble.dataset.pendingMarkdownHtml = html;
  bubble.classList.add("has-pending-markdown-freeze");
  installPendingFreezeGate(bubble);
}

function installPendingFreezeGate(bubble) {
  if (bubble.dataset.pendingFreezeGate === "installed") return;
  bubble.dataset.pendingFreezeGate = "installed";
  document.addEventListener("selectionchange", () => {
    if (!bubble.isConnected || selectionTouches(bubble)) return;
    const html = bubble.dataset.pendingMarkdownHtml;
    if (html) installFrozenHtml(bubble, html);
  });
}

function installFrozenHtml(bubble, html) {
  bubble.innerHTML = html;
  bubble.dataset.frozenMarkdown = html;
  delete bubble.dataset.pendingMarkdownHtml;
  bubble.classList.remove("has-pending-markdown-freeze", "is-streaming-markdown");
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
