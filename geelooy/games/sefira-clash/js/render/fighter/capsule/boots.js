//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the boots vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Authored hero boots.
 *
 * Chapter 172: the boot grips the stage. Wide, flat, bright, and grounded, it
 * cuts away the old skating oval and gives the fighter weight.
 */
import { LIMB_BOUNDS } from './limbBounds.js';

/**
 * Reveals the draw boot behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} foot The foot value entering this behavior.
 * @param {*} side The side value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function drawBoot(ctx, foot, side, color) {
	ctx.save();
	ctx.translate(foot.x, foot.y);
	ctx.rotate(side * 0.06);
	ctx.fillStyle = color;
	ctx.strokeStyle = 'rgba(0,0,0,.88)';
	ctx.lineWidth = 2.8;
	ctx.beginPath();
	ctx.ellipse(side * 5, 0, LIMB_BOUNDS.boot.width, LIMB_BOUNDS.boot.height, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.globalAlpha = 0.28;
	ctx.fillStyle = 'rgba(255,255,255,.75)';
	ctx.beginPath();
	ctx.ellipse(side * -3, -4, 6, 2, -0.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
