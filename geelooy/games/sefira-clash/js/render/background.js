//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the background vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { paletteFor } from './background/palette.js';
import { parchmentTexture } from './background/parchmentTexture.js';
import { drawTreeOfLife } from './background/treeOfLife.js';

/**
 * B"H
 * Cached background renderer.
 *
 * Chapter 89: Android was choking because the parchment was reborn every
 * frame. The Awtsmoos still renews creation, but this canvas caches the vessel
 * until map or viewport changes. Vast beauty, tiny cost.
 */
const cache = new Map();

/**
 * Reveals the draw background behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} map The map value entering this behavior.
 * @param {*} w The w value entering this behavior.
 * @param {*} h The h value entering this behavior.
 */
export function drawBackground(ctx, map, w, h) {
	const key = `${map.id}:${Math.round(w)}x${Math.round(h)}`;
	let bg = cache.get(key);
	if (!bg) {
		bg = makeBackground(map, w, h);
		cache.clear();
		cache.set(key, bg);
	}
	ctx.drawImage(bg, 0, 0, w, h);
}

function makeBackground(map, w, h) {
	const scale = Math.min(1, 960 / Math.max(w, h));
	const bw = Math.max(320, Math.round(w * scale));
	const bh = Math.max(240, Math.round(h * scale));
	const canvas = document.createElement('canvas');
	canvas.width = bw;
	canvas.height = bh;
	const c = canvas.getContext('2d');
	const palette = paletteFor(map);
	const texture = parchmentTexture(bw, bh, palette);
	c.drawImage(texture, 0, 0, bw, bh);
	drawCloudInk(c, bw, bh, palette);
	drawTreeOfLife(c, bw, bh, palette);
	return canvas;
}

function drawCloudInk(ctx, w, h, palette) {
	ctx.save();
	ctx.globalAlpha = 0.08;
	ctx.strokeStyle = palette.ink;
	ctx.lineWidth = 1;
	for (let i = 0; i < 9; i++) {
		const y = h * 0.22 + Math.sin(i * 1.7) * 14;
		ctx.beginPath();
		for (let x = -40; x < w + 40; x += 56) {
			const yy = y + Math.sin(x * 0.012 + i) * 18;
			if (x < 0) ctx.moveTo(x, yy);
			else ctx.lineTo(x, yy);
		}
		ctx.stroke();
	}
	ctx.restore();
}
