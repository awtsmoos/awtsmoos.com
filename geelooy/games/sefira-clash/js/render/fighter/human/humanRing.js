//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the human ring vessel in this instant, revealing
 * its focused js render fighter human service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import { drawOutlinedText } from '../labels.js';
/**
 * Reveals the draw human ring behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} lang The lang value entering this behavior.
 */
export function drawHumanRing(ctx, f, color, lang) {
	const speed = Math.min(1, Math.abs(f.vx || 0) / 12),
		pulse = 1 + Math.sin((f.motionClock || 0) * 0.09) * 0.04 + (lang.panic || 0) * 0.12;
	ctx.strokeStyle = f.danger || lang.panic > 0.55 ? '#fff2a8' : color;
	ctx.lineWidth = 4 + speed * 2;
	ctx.beginPath();
	ctx.ellipse(
		f.x,
		f.y + 4,
		(50 + speed * 10) * pulse,
		(12 - speed * 2) / pulse,
		0,
		0,
		Math.PI * 2
	);
	ctx.stroke();
	drawOutlinedText(ctx, 'YOU', f.x, f.y - 184, 18, '#fff7b5');
}
