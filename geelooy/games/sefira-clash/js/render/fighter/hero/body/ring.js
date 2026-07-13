//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ring vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hero ring and contact shadow.
 *
 * Chapter 184: the hero stands on a glowing covenant with the stage.
 */
import { HERO } from '../style.js';

/**
 * Reveals the draw hero ring behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} human The human value entering this behavior.
 */
export function drawHeroRing(ctx, p, color, human) {
	const y = Math.max(p.leftFoot.y, p.rightFoot.y) + 5;
	ctx.save();
	ctx.globalAlpha = human ? 0.75 : 0.38;
	ctx.strokeStyle = color;
	ctx.lineWidth = human ? 3.5 : 2;
	ctx.beginPath();
	ctx.ellipse(p.pelvis.x, y, HERO.ring.rx, HERO.ring.ry, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.globalAlpha = 0.18;
	ctx.fillStyle = '#000';
	ctx.beginPath();
	ctx.ellipse(p.pelvis.x, y + 3, HERO.ring.rx * 0.8, HERO.ring.ry * 0.7, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
