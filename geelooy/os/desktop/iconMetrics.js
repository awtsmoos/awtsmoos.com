// B"H
import { isMobileDesktop } from './mobile.js';
import { desktopInsets } from './safeArea.js';

export function metrics(surface) {
  const mobile = isMobileDesktop(surface);
  const inset = desktopInsets(surface?.parentElement || surface);
  const w = surface?.clientWidth || innerWidth;
  const usable = Math.max(1, w - inset.left - inset.right);
  return mobile ? mobileMetrics(usable, inset) : desktopMetrics(usable, inset);
}

export function contentHeight(count, surface) {
  const m = metrics(surface);
  const rows = Math.ceil(Math.max(1, count) / Math.max(1, m.cols));
  return m.inset.top + rows * m.cellH + m.inset.bottom + 36;
}

export function surfaceScroller(surface) {
  return surface?.parentElement || surface;
}

function mobileMetrics(usable, inset) {
  const iconW = Math.min(440, Math.max(188, usable - 24));
  return { mobile:true, cols:1, cellW:usable, cellH:176, iconW, iconH:148, inset };
}

function desktopMetrics(usable, inset) {
  const cols = Math.max(1, Math.floor(usable / 112));
  const cellW = Math.max(96, Math.floor(usable / cols));
  return { mobile:false, cols, cellW, cellH:96, iconW:92, iconH:82, inset };
}

/** B"H: metrics now include scroll-height revelation, not only rectangles. */
