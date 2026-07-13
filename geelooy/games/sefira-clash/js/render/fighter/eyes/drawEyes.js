//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw eyes vessel in this instant, revealing
 * its focused js render fighter eyes service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
import { eyeTarget } from './eyeTarget.js';
import { eyeTracking } from './eyeTracking.js';
import { blinkController } from './blinkController.js';
import { panicEyes } from './panicEyes.js';
import { huntEyes } from './huntEyes.js';
import { damageEyes } from './damageEyes.js';
/**
 * Reveals the draw eyes behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} y The y value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} language The language value entering this behavior.
 */
export function drawEyes(ctx, f, x, y, color, language) {
	const target = eyeTarget(f),
		track = eyeTracking(f, target),
		blink = blinkController(f),
		panic = panicEyes(f),
		hunt = huntEyes(f),
		damage = damageEyes(f);
	if (blink.closed) {
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x + (f.face || 1) * 3, y - 2);
		ctx.lineTo(x + (f.face || 1) * 13, y - 2);
		ctx.stroke();
		return;
	}
	ctx.fillStyle = f.danger || panic.wide > 1.4 ? '#fff2a8' : color;
	ctx.beginPath();
	ctx.ellipse(
		x + (f.face || 1) * (6 + track.x * 5) + damage.shake,
		y - 2 + track.y * 3 + panic.jitter,
		2.6 * (language.eyeScale || 1) * panic.wide,
		Math.max(1.1, 2.3 * hunt.squint - damage.droop),
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();
	if (hunt.glint > 0.5) {
		ctx.strokeStyle = '#fff7b5';
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(x + (f.face || 1) * 10, y - 6);
		ctx.lineTo(x + (f.face || 1) * 18, y - 7);
		ctx.stroke();
	}
}
