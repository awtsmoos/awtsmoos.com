//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the fighter preview vessel in this instant, revealing
 * its focused js render ui service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { drawFighters } from '../fighters.js';

/**
 * B"H � A small preview chamber for the generated fighter. It uses the same
 * fighter renderer as battle, proving the generator panel is not a fake UI.
 */
export function drawFighterPreview(ctx, fighter, x, y, w, h) {
	ctx.save();
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	ctx.clip();
	ctx.fillStyle = 'rgba(255,255,255,.035)';
	ctx.fillRect(x, y, w, h);
	ctx.strokeStyle = 'rgba(255,255,255,.12)';
	for (let gx = x; gx < x + w; gx += 18) line(ctx, gx, y, gx, y + h);
	for (let gy = y; gy < y + h; gy += 18) line(ctx, x, gy, x + w, gy);
	const clone = { ...fighter, x: x + w / 2, y: y + h * 0.78 };
	drawFighters(ctx, [clone]);
	ctx.restore();
}

function line(ctx, x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}
