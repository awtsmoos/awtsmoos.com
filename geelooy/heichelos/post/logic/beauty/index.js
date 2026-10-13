// B"H
/**
 * Chapter 329: Reader beauty is renewed without multiplying watchers.
 * Repeated boot passes update the spine and controls, then replace the single
 * observer with one fresh observer for the current DOM.
 */

import { bindCurrentSectionTracker } from './currentSectionTracker.js';
import { bindFocusModeState } from './focusModeState.js';
import { manifestProgressSpine, updateProgressSpine } from './progressSpine.js';
import { blessReaderControlState } from './controlState.js';
import { bindScrollSpy, restoreScrollPosition } from '../scroll/scrollSpyRestoration.js';

export function runReaderBeauty() {
  blessReaderControlState();
  manifestProgressSpine();

  const previous = window.__awtsmoosReaderBeauty;
  if (previous?.unbindFocus && !previous.focusReusable) previous.unbindFocus();

  const unbindFocus = bindFocusModeState();
  const unbindTracker = bindCurrentSectionTracker({ onCurrent: updateProgressSpine });
  // Yaakov's scroll-spy: highlight the verse being read + remember position.
  const unbindSpy = bindScrollSpy();
  const state = { active: true, unbindFocus, unbindTracker, unbindSpy, focusReusable: true };
  window.__awtsmoosReaderBeauty = state;
  // Restore scroll after content settles (deep-links take precedence inside).
  if (!state.restoredOnce) {
    state.restoredOnce = true;
    setTimeout(() => { try { restoreScrollPosition(); } catch {} }, 900);
  }
  return state;
}
