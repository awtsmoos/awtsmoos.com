//B"H

const BOTTOM_LOCK_PX = 132;

/**
 * Live-scroll covenant:
 * - Follow the bottom by default.
 * - Only an explicit user upward gesture escapes.
 * - Scrolling back near bottom re-arms live follow.
 * - Passive DOM growth must never falsely pin the user in the middle.
 *
 * @param {object} renderer Message renderer vessel.
 * @param {{force?:boolean, instant?:boolean}} options Scroll options.
 * @returns {void}
 */
export function scrollToLiveBottom(renderer, options = {}) {
  if (!renderer?.chatBox) return;
  const chatBox = renderer.chatBox;
  if (!options.force && shouldSuppressAutoFollow(renderer, chatBox)) return;
  const schedule = globalThis.requestAnimationFrame || (callback => setTimeout(callback, 16));
  const pulse = () => {
    if (!options.force && shouldSuppressAutoFollow(renderer, chatBox)) return;
    markProgrammaticScroll(chatBox);
    scrollContainerToBottom(chatBox, options.instant ? "auto" : "auto");
  };
  markProgrammaticScroll(chatBox, 260);
  schedule(() => {
    pulse();
    schedule(pulse);
    setTimeout(pulse, 90);
  });
}

/** @param {HTMLElement} chatBox @returns {boolean} */
export function isNearBottom(chatBox) {
  if (!chatBox) return true;
  return chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight <= BOTTOM_LOCK_PX;
}

/** @param {HTMLElement} chatBox @param {number} ms @returns {void} */
export function markProgrammaticScroll(chatBox, ms = 220) {
  if (!chatBox) return;
  chatBox.__awtsmoosProgrammaticScrollUntil = Date.now() + ms;
}

/** @param {HTMLElement} chatBox @returns {boolean} */
export function isProgrammaticScroll(chatBox) {
  return Date.now() < Number(chatBox?.__awtsmoosProgrammaticScrollUntil || 0);
}

function shouldSuppressAutoFollow(renderer, chatBox) {
  if (renderer.userPinnedScroll && !isNearBottom(chatBox)) return true;
  return Date.now() < Number(chatBox.__awtsmoosPanelInteractionUntil || 0);
}

function scrollContainerToBottom(chatBox, behavior) {
  if (!chatBox) return;
  const top = Math.max(0, chatBox.scrollHeight - chatBox.clientHeight);
  chatBox.scrollTo?.({ top, behavior });
  chatBox.scrollTop = top;
  chatBox.querySelector?.(":scope > .chat-bottom-sentinel")?.scrollIntoView?.({ block: "end", inline: "nearest" });
}
