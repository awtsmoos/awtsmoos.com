//B"H
import { renderMarkdown } from "../markdown.js";

/**
 * Chapter 51: The Living Sentence Chose Its Vessel.
 *
 * The Awtsmoos lets plain streaming speech flow through one stable text node,
 * so the DOM does not flash with every syllable. But when markdown structure is
 * visible — fences, headings, lists, quotes, links, or emphasis — the renderer
 * honors that structure immediately. Finalized records always freeze into full
 * markdown HTML.
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
  if (record.streaming && !looksLikeStructuredMarkdown(text)) {
    updatePlainActor(bubble, text);
    return;
  }
  bubble.innerHTML = renderMarkdown(text);
}

/**
 * @param {object} record Message record.
 * @returns {void}
 */
export function finalizeTextRecord(record) {
  if (!record) return;
  record.streaming = false;
  record.renderedText = null;
  record.renderedExpanded = null;
}

function updatePlainActor(bubble, text) {
  let node = bubble.querySelector(":scope > .message-live-text");
  if (!node || bubble.childNodes.length !== 1) {
    bubble.textContent = "";
    node = document.createElement("span");
    node.className = "message-live-text";
    bubble.append(node);
  }
  if (node.textContent !== text) node.textContent = text;
}

function looksLikeStructuredMarkdown(text = "") {
  return /(^|\n)\s{0,3}(```|~~~)|(^|\n)\s{0,3}#{1,6}\s+|(^|\n)\s{0,3}[-*+]\s+|(^|\n)\s{0,3}\d+[.)]\s+|(^|\n)\s{0,3}>\s|\[[^\]]+\]\(https?:\/\/|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__/m.test(text);
}
