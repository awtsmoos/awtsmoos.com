//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the helmet shell vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Sculpted helmet shell.
 *
 * Chapter 195: the helmet is a glossy black moon edged with living color.
 */
import { MOCKUP } from '../converter/MockupMeasurements.js';

/**
 * Reveals the draw helmet shell behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawHelmetShell(ctx, p, mat) {
	const s = p.scale || 1;
	ctx.save();
	ctx.translate(p.head.x, p.head.y);
	const g = ctx.createRadialGradient(-8 * s, -11 * s, 4 * s, 0, 0, MOCKUP.head.ry * s);
	g.addColorStop(0, 'rgba(255,255,255,.18)');
	g.addColorStop(0.28, mat.shellSoft);
	g.addColorStop(1, mat.shell);
	ctx.fillStyle = g;
	ctx.strokeStyle = mat.accent;
	ctx.lineWidth = 3.6 * s;
	ctx.beginPath();
	ctx.ellipse(0, 0, MOCKUP.head.rx * s, MOCKUP.head.ry * s, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.globalAlpha = 0.25;
	ctx.fillStyle = mat.glint;
	ctx.beginPath();
	ctx.ellipse(-8 * s, -11 * s, 6 * s, 3.5 * s, -0.55, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
