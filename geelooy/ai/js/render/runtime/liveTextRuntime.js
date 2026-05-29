//B"H
import { appendLivePlainTextDelta } from "./liveTextDelta.js";
import { freezeMarkdownWhenSafe } from "./liveTextFreeze.js";

/**
 * Chapter 74 Reforged: The Stream Became Feather And Thunder.
 *
 * While a response is alive, the main thread performs one tiny sacred act:
 * append new text to the DOM. It does not parse markdown. It does not rebuild
 * the whole answer. It does not pour old oceans through new cups. The Awtsmoos
 * lets the living letters arrive as deltas, and only the completed answer is
 * carved into markdown.
 *
 * @param {object} renderer Message renderer, present for API stability.
 * @param {object} record Message record.
 * @param {string} visibleText Complete visible text currently known.
 * @returns {void}
 */
export function updateLiveText(renderer, record, visibleText) {
  void renderer;
  const bubble = record?.bubble;
  if (!bubble) return;
  const text = String(visibleText || "");
  bubble.dataset.markdown = "active";
  if (record.streaming) {
    bubble.classList.add("is-streaming-markdown");
    appendLivePlainTextDelta(bubble, text);
    return;
  }
  freezeMarkdownWhenSafe(bubble, text);
}

/**
 * B"H — clears live paint marks before historical freezing.
 *
 * @param {object} record Message record.
 * @returns {void}
 * @sideEffects Marks the record no longer streaming/loading.
 */
export function finalizeTextRecord(record) {
  if (!record) return;
  record.streaming = false;
  record.loading = false;
  record.renderedText = null;
  record.renderedExpanded = null;
}
