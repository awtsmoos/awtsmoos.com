//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the gloves vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Authored hero gloves.
 *
 * Chapter 171: the fist becomes visible from across the phone. Every punch now
 * carries a real glove, round and heavy like the mockup.
 */
import { LIMB_BOUNDS } from './limbBounds.js';

/**
 * Reveals the draw glove behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function drawGlove(ctx, p, color) {
	ctx.save();
	ctx.translate(p.x, p.y);
	ctx.fillStyle = color;
	ctx.strokeStyle = 'rgba(0,0,0,.88)';
	ctx.lineWidth = 2.8;
	ctx.beginPath();
	ctx.ellipse(
		0,
		0,
		LIMB_BOUNDS.glove.radius,
		LIMB_BOUNDS.glove.radius * 0.95,
		-0.12,
		0,
		Math.PI * 2
	);
	ctx.fill();
	ctx.stroke();
	ctx.globalAlpha = 0.26;
	ctx.fillStyle = 'rgba(255,255,255,.8)';
	ctx.beginPath();
	ctx.ellipse(-4, -4, 3.7, 2, -0.4, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
