//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hero gloves vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Smaller readable hero gloves.
 *
 * Chapter 221: the gloves become fists, not balloons. They punctuate attacks
 * without swallowing the arms.
 */
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { ARM_PARTS } from '../converter/HeroPartMap.js';

/**
 * Reveals the draw hero gloves behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawHeroGloves(ctx, p, mat) {
	for (const part of ARM_PARTS) drawOne(ctx, p[part.hand], p.scale || 1, mat);
}

function drawOne(ctx, h, s, mat) {
	ctx.save();
	ctx.translate(h.x, h.y);
	ctx.fillStyle = mat.accent;
	ctx.strokeStyle = mat.ink;
	ctx.lineWidth = 2.2 * s;
	ctx.beginPath();
	ctx.ellipse(0, 0, MOCKUP.glove.rx * s, MOCKUP.glove.ry * s, -0.1, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.globalAlpha = 0.18;
	ctx.fillStyle = mat.glint;
	ctx.beginPath();
	ctx.ellipse(-3 * s, -3 * s, 3 * s, 1.5 * s, -0.4, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
