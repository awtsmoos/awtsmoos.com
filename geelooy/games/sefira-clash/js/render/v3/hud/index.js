//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the index vessel in this instant, revealing
 * its focused js render v3 hud service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 HUD entry. */
import { drawMobileHud } from './MobileHud.js';
import { drawDesktopHud } from './DesktopHud.js';
/**
 * Reveals the draw v3 hud behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} state The state value entering this behavior.
 * @param {*} w The w value entering this behavior.
 * @param {*} h The h value entering this behavior.
 */
export function drawV3Hud(ctx, state, w, h) {
	w < 760 ? drawMobileHud(ctx, state, w, h) : drawDesktopHud(ctx, state, w, h);
}
