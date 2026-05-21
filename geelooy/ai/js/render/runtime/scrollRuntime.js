//B"H

const BOTTOM_LOCK_PX = 72;

/**
 * Chapter 38: The River Bowed Before the Climber.
 *
 * The Awtsmoos pours live letters downward, but a reader who climbs upward is
 * not chained to the flood. Live streaming pins to bottom only while the reader
 * is already near the bottom; one upward gesture breaks the spell until the
 * reader returns to the lower gate. The final animation breath re-checks that
 * covenant so queued scrolls cannot drag the reader back after escape.
 *
 * @param {object} renderer MessageRenderer-like owner of chatBox and sentinel.
 * @param {{instant?: boolean, force?: boolean}} options Scroll behavior controls.
 * @returns {void}
 */
export function scrollToLiveBottom(renderer, options = {}) {
  if (!renderer?.chatBox) return;
  const chatBox = renderer.chatBox;
  if (!options.force && shouldSuppressAutoFollow(renderer, chatBox)) return;
  if (!options.force && !isNearBottom(chatBox)) {
    renderer.userPinnedScroll = true;
    return;
  }
  const behavior = options.instant ? "auto" : "auto";
  const schedule = globalThis.requestAnimationFrame || (callback => setTimeout(callback, 16));
  schedule(() => {
    if (!options.force && shouldSuppressAutoFollow(renderer, chatBox)) return;
    if (!options.force && !isNearBottom(chatBox)) {
      renderer.userPinnedScroll = true;
      return;
    }
    scrollContainerToBottom(chatBox, behavior);
  });
}

/**
 * @param {Element} chatBox Scroll container.
 * @returns {boolean} Whether the user is close enough to keep auto-following.
 */
export function isNearBottom(chatBox) {
  if (!chatBox) return true;
  return chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight <= BOTTOM_LOCK_PX;
}

function shouldSuppressAutoFollow(renderer, chatBox) {
  if (renderer.userPinnedScroll) return true;
  return Date.now() < Number(chatBox.__awtsmoosPanelInteractionUntil || 0);
}

function scrollContainerToBottom(chatBox, behavior) {
  chatBox?.scrollTo?.({ top: chatBox.scrollHeight, behavior });
}
