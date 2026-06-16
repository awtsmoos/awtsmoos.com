/** B"H — V3 desktop HUD reuses top damage cards. */
import { drawTopDamageBar } from './TopDamageBar.js';
export function drawDesktopHud(ctx, state, w) { drawTopDamageBar(ctx, state, w); }
