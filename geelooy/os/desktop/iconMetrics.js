// B"H
import { isMobileDesktop, mobileColumns } from './mobile.js';
import { desktopInsets } from './safeArea.js';
export function metrics(surface) { const mobile = isMobileDesktop(surface); const inset = desktopInsets(surface?.parentElement || surface); const w = surface?.clientWidth || innerWidth; const cols = mobile ? mobileColumns(w) : Math.max(1, Math.floor((w - inset.left - inset.right) / 112)); const cellW = Math.max(96, Math.floor((w - inset.left - inset.right) / cols)); return { mobile, cols, cellW, cellH:mobile ? 118 : 96, iconW:mobile ? 96 : 92, iconH:mobile ? 104 : 82, inset }; }
/** B"H: one metrics vessel stops icon overlap at the root. */
