/** B"H — V3 HUD entry. */
import { drawMobileHud } from './MobileHud.js';
import { drawDesktopHud } from './DesktopHud.js';
export function drawV3Hud(ctx, state, w, h) { w < 760 ? drawMobileHud(ctx, state, w, h) : drawDesktopHud(ctx, state, w, h); }
