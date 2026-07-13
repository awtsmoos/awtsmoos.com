//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the helmet vessel in this instant, revealing
 * its focused js render v3 character body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 helmet shell. */
import { V3_STYLE } from '../CharacterStyle.js';
/**
 * Reveals the draw helmet behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawHelmet(ctx, p, mat) {
	ctx.save();
	ctx.translate(p.head.x, p.head.y);
	const g = ctx.createRadialGradient(-7, -10, 3, 0, 0, V3_STYLE.head.ry);
	g.addColorStop(0, 'rgba(255,255,255,.18)');
	g.addColorStop(0.3, mat.soft);
	g.addColorStop(1, mat.shell);
	ctx.fillStyle = g;
	ctx.strokeStyle = mat.accent;
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.ellipse(0, 0, V3_STYLE.head.rx, V3_STYLE.head.ry, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
}
