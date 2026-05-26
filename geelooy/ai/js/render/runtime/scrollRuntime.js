//B"H

const BOTTOM_LOCK_PX = 96;

/**
 * Live-scroll covenant:
 * - Follow the bottom by default.
 * - Only an explicit user upward gesture escapes.
 * - Scrolling back near bottom re-arms live follow.
 * - Passive DOM growth must never falsely pin the user in the middle.
 */
export function scrollToLiveBottom(renderer, options = {}) {
  if (!renderer?.chatBox) return;
  const chatBox = renderer.chatBox;
  if (!options.force && shouldSuppressAutoFollow(renderer, chatBox)) return;
  const schedule = globalThis.requestAnimationFrame || (callback => setTimeout(callback, 16));
  markProgrammaticScroll(chatBox);
  schedule(() => {
    if (!options.force && shouldSuppressAutoFollow(renderer, chatBox)) return;
    markProgrammaticScroll(chatBox);
    scrollContainerToBottom(chatBox, options.instant ? "auto" : "auto");
  });
}

export function isNearBottom(chatBox) {
  if (!chatBox) return true;
  return chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight <= BOTTOM_LOCK_PX;
}

export function markProgrammaticScroll(chatBox, ms = 180) {
  if (!chatBox) return;
  chatBox.__awtsmoosProgrammaticScrollUntil = Date.now() + ms;
}

export function isProgrammaticScroll(chatBox) {
  return Date.now() < Number(chatBox?.__awtsmoosProgrammaticScrollUntil || 0);
}

function shouldSuppressAutoFollow(renderer, chatBox) {
  if (renderer.userPinnedScroll) return true;
  return Date.now() < Number(chatBox.__awtsmoosPanelInteractionUntil || 0);
}

function scrollContainerToBottom(chatBox, behavior) {
  if (!chatBox) return;
  chatBox.scrollTo?.({ top: chatBox.scrollHeight, behavior });
  chatBox.scrollTop = chatBox.scrollHeight;
}
