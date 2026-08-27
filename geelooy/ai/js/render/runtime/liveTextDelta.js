//B"H

/**
 * Chapter 75: The River Refused To Rebuild The Mountain.
 *
 * A live answer is not a cathedral yet; it is rain striking glass. The
 * Awtsmoos lets every new syllable arrive as a small text node, never forcing
 * the main thread to re-interpret the whole scroll while the stream is still
 * breathing.
 *
 * @param {HTMLElement} bubble Message bubble that owns the live text actor.
 * @param {string} text Complete visible text currently known for the stream.
 * @returns {void}
 * @sideEffects Appends only the new delta as DOM text when possible.
 */
export function appendLivePlainTextDelta(bubble, text) {
  const actor = ensureLiveActor(bubble);
  const previous = actor.dataset.liveText || "";
  if (text === previous) return;
  if (text.startsWith(previous)) return appendDelta(actor, previous, text);
  if (previous.startsWith(text) || previous.includes(text)) return;
  const overlap = longestSuffixPrefix(previous, text, 12000);
  if (overlap) return appendDelta(actor, previous, previous + text.slice(overlap));
  actor.textContent = text;
  actor.dataset.liveText = text;
}

/**
 * B"H — creates the only live-streaming child.
 *
 * @param {HTMLElement} bubble Message bubble.
 * @returns {HTMLElement} Stable text actor.
 */
export function ensureLiveActor(bubble) {
  let actor = bubble.querySelector(":scope > .message-live-text");
  if (actor) return actor;
  bubble.textContent = "";
  actor = document.createElement("span");
  actor.className = "message-live-text";
  actor.dataset.liveText = "";
  bubble.append(actor);
  return actor;
}

function appendDelta(actor, previous, next) {
  appendTextNode(actor, next.slice(previous.length));
  actor.dataset.liveText = next;
}

function appendTextNode(actor, text) {
  if (!text) return;
  const node = document.createTextNode(text);
  actor.append(node);
}

function longestSuffixPrefix(left, right, max) {
  const limit = Math.min(max, left.length, right.length);
  for (let size = limit; size > 0; size--) {
    if (left.slice(-size) === right.slice(0, size)) return size;
  }
  return 0;
}
