//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw limb ghosts vessel in this instant, revealing
 * its focused js render fighter limbs service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
import { drawOffsetBone } from './drawBoneLine.js';
/**
 * Reveals the draw limb ghosts behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} language The language value entering this behavior.
 */
export function drawLimbGhosts(ctx, f, color, language) {
	if (!f.attack && Math.abs(f.vx || 0) <= 9) return;
	ctx.save();
	ctx.globalAlpha = 0.16 + (language.attackGlow || 0) * 0.12;
	ctx.strokeStyle = color;
	ctx.lineWidth = 5;
	const dx = -(f.vx || f.face || 1) * 2.2,
		dy = -(f.vy || 0) * 1.2;
	for (const id of ['rightLowerArm', 'rightCalf']) drawOffsetBone(ctx, f.bones[id], dx, dy);
	ctx.restore();
}
