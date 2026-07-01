// B"H
import { isMobileDesktop, mobileColumns } from './mobile.js';
import { desktopInsets } from './safeArea.js';
export function metrics(surface) {
  const mobile = isMobileDesktop(surface);
  const inset = desktopInsets(surface?.parentElement || surface);
  const w = surface?.clientWidth || innerWidth;
  const cols = mobile ? mobileColumns(w) : Math.max(1, Math.floor((w - inset.left - inset.right) / 112));
  const usable = Math.max(1, w - inset.left - inset.right);
  const cellW = mobile ? Math.max(136, Math.floor(usable / cols)) : Math.max(96, Math.floor(usable / cols));
  return { mobile, cols, cellW, cellH: mobile ? 106 : 96, iconW: mobile ? Math.min(150, cellW - 18) : 92, iconH: mobile ? 94 : 82, inset };
}
/** B"H: mobile icon metrics reject cramped constellations and reveal one readable lane. */
