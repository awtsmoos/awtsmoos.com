// B"H
import { isMobileDesktop } from './mobile.js';
import { desktopInsets } from './safeArea.js';
export function metrics(surface) {
  const mobile = isMobileDesktop(surface), inset = desktopInsets(surface?.parentElement || surface);
  const w = surface?.clientWidth || innerWidth, usable = Math.max(1, w - inset.left - inset.right);
  if (mobile) {
    const iconW = Math.min(220, Math.max(168, usable - 28));
    return { mobile, cols:1, cellW:usable, cellH:146, iconW, iconH:128, inset };
  }
  const cols = Math.max(1, Math.floor(usable / 112)), cellW = Math.max(96, Math.floor(usable / cols));
  return { mobile, cols, cellW, cellH:96, iconW:92, iconH:82, inset };
}
/** B"H: mobile metrics now choose one deliberate ladder instead of pretending a phone is a desk. */
