//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the auras vessel in this instant, revealing
 * its focused js render fighter service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import { radialGlow } from '../lighting/glow.js';
import { drawOutlinedText } from './labels.js';
import { auraColor } from './colors.js';
import { drawHumanRing } from './human/humanRing.js';
/**
 * Reveals the draw charge aura behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function drawChargeAura(ctx, f, color) {
	const charge = f.chargeGlow || 0;
	if (charge < 0.05) return;
	const max = charge > 0.92,
		coil = Math.sin((f.motionClock || 0) * (0.35 + charge)) * (6 + charge * 8),
		r = 46 + charge * 72 + coil;
	ctx.save();
	ctx.globalAlpha = 0.18 + charge * 0.38;
	ctx.strokeStyle = auraColor(f, color);
	ctx.lineWidth = max ? 7 : 3 + charge * 4;
	ctx.beginPath();
	ctx.arc(f.x, f.y - 86, r, 0, Math.PI * 2);
	ctx.stroke();
	radialGlow(
		ctx,
		f.x,
		f.y - 86,
		r * 0.9,
		max ? '#fff2a888' : color.replace('hsl', 'hsla').replace(')', ' / .45)')
	);
	ctx.restore();
	if (max) drawOutlinedText(ctx, 'MAX', f.x, f.y - 225, 18, '#fff2a8');
}
/**
 * Reveals the draw player ring behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} lang The lang value entering this behavior.
 */
export const drawPlayerRing = (ctx, f, color, lang) => drawHumanRing(ctx, f, color, lang);
/**
 * Reveals the draw danger aura behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function drawDangerAura(ctx, f) {
	const p = 34 + Math.sin((f.motionClock || 0) * 0.18) * 8;
	radialGlow(ctx, f.x, f.y - 92, p, '#ffcf55aa');
	drawOutlinedText(ctx, 'DANGER', f.x, f.y - 210, 18, '#ffdf70');
}
/**
 * Reveals the draw dodge streak behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function drawDodgeStreak(ctx, f, color) {
	ctx.globalAlpha = 0.34;
	ctx.strokeStyle = color;
	ctx.lineWidth = 12;
	ctx.beginPath();
	ctx.moveTo(f.x - (f.vx || 0) * 4, f.y - 95 - (f.vy || 0) * 2);
	ctx.lineTo(f.x, f.y - 95);
	ctx.stroke();
	ctx.globalAlpha = 1;
}
/**
 * Reveals the draw shield behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 */
export function drawShield(ctx, f) {
	ctx.strokeStyle = '#9affc5cc';
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.arc(f.x + (f.face || 1) * 22, f.y - 82, 46, 0, Math.PI * 2);
	ctx.stroke();
}
/**
 * Reveals the draw attack arc behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function drawAttackArc(ctx, f, color) {
	const hand = f.bones.rightLowerArm?.tip || { x: f.x + (f.face || 1) * 50, y: f.y - 90 },
		r = f.attack.fullCharge ? 96 : 50;
	radialGlow(
		ctx,
		hand.x,
		hand.y,
		r,
		f.attack.fullCharge ? '#fff2a888' : color.replace('hsl', 'hsla').replace(')', ' / .45)')
	);
	ctx.strokeStyle = f.attack.fullCharge ? '#fff2a8' : color;
	ctx.lineWidth = f.attack.fullCharge ? 9 : 5;
	ctx.beginPath();
	ctx.arc(f.x + (f.face || 1) * 50, f.y - 95, f.attack.fullCharge ? 88 : 55, -0.8, 0.8);
	ctx.stroke();
}
