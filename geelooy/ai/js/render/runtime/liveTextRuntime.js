//B"H
import { renderMarkdown } from "../markdown.js";

/**
 * Chapter 51: The Living Sentence Refused To Murder Selection.
 *
 * While a response streams, every visible letter flows through one stable text
 * actor. No markdown preview, no innerHTML churn, no replacing the vessel while
 * a human is selecting text. When the stream finishes, the record is marked
 * non-streaming and the next refresh may freeze the full text into markdown.
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
  if (record.streaming) {
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
  record.loading = false;
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
