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

export function runReaderBeauty() {
  blessReaderControlState();
  manifestProgressSpine();

  const previous = window.__awtsmoosReaderBeauty;
  if (previous?.unbindFocus && !previous.focusReusable) previous.unbindFocus();

  const unbindFocus = bindFocusModeState();
  const unbindTracker = bindCurrentSectionTracker({ onCurrent: updateProgressSpine });
  const state = { active: true, unbindFocus, unbindTracker, focusReusable: true };
  window.__awtsmoosReaderBeauty = state;
  return state;
}
