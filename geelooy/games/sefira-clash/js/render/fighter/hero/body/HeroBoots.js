//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hero boots vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Smaller planted hero boots.
 *
 * Chapter 222: boots stop being pancakes. The Awtsmoos plants them narrow and
 * confident so the legs, not the feet, carry the silhouette.
 */
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { LEG_PARTS } from '../converter/HeroPartMap.js';

/**
 * Reveals the draw hero boots behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawHeroBoots(ctx, p, mat) {
	for (const part of LEG_PARTS) drawOne(ctx, p[part.foot], part.sign, p.scale || 1, mat);
}

function drawOne(ctx, foot, sign, s, mat) {
	ctx.save();
	ctx.translate(foot.x, foot.y);
	ctx.rotate(sign * 0.04);
	ctx.fillStyle = mat.accent;
	ctx.strokeStyle = mat.ink;
	ctx.lineWidth = 2.2 * s;
	ctx.beginPath();
	ctx.ellipse(sign * 3 * s, 0, MOCKUP.boot.rx * s, MOCKUP.boot.ry * s, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
