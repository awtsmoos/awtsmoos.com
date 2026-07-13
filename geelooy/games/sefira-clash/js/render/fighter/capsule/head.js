//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the head vessel in this instant, revealing
 * its focused js render fighter capsule service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Authored hero helmet.
 *
 * Chapter 169: no smile remains. The helmet is glossy, heavy, and attached;
 * the visor alone tells the fighter's direction like a flash of green lightning.
 */
import { clamp } from './math.js';

/**
 * Reveals the draw capsule head behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} language The language value entering this behavior.
 */
export function drawCapsuleHead(ctx, p, color, language = {}) {
	const lean = clamp(language.lean || 0, -0.12, 0.12);
	ctx.save();
	ctx.translate(p.head.x, p.head.y);
	ctx.rotate(lean * 0.08);
	drawHelmet(ctx, color);
	drawVisor(ctx, color, p.face);
	ctx.restore();
}

function drawHelmet(ctx, color) {
	ctx.fillStyle = 'rgba(2,3,7,1)';
	ctx.strokeStyle = color;
	ctx.lineWidth = 3.4;
	ctx.beginPath();
	ctx.ellipse(0, 0, 23, 25, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.save();
	ctx.globalAlpha = 0.24;
	ctx.fillStyle = 'rgba(255,255,255,.85)';
	ctx.beginPath();
	ctx.ellipse(-7, -10, 6, 3.4, -0.55, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}

function drawVisor(ctx, color, face) {
	ctx.fillStyle = color;
	ctx.strokeStyle = 'rgba(0,0,0,.92)';
	ctx.lineWidth = 2.2;
	ctx.beginPath();
	ctx.moveTo(-16, -3);
	ctx.quadraticCurveTo(face * 2, 8, face * 19, -7);
	ctx.lineTo(face * 15, 5);
	ctx.quadraticCurveTo(face * 0, 12, -15, 6);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}
