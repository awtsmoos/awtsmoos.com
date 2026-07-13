//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the map preview vessel in this instant, revealing
 * its focused js render minimap service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { paletteFor } from '../background/palette.js';

/**
 * B"H � Minimap/thumbnail renderer: tiny map truth, not screenshots. It
 * scales platform rectangles and blast bounds into the map-card chambers.
 */
export function drawMapPreview(ctx, map, x, y, w, h) {
	const p = paletteFor(map);
	const g = ctx.createLinearGradient(x, y, x, y + h);
	g.addColorStop(0, p.skyTop);
	g.addColorStop(1, p.skyBottom);
	ctx.fillStyle = g;
	ctx.fillRect(x, y, w, h);
	ctx.strokeStyle = 'rgba(255,255,255,.22)';
	ctx.strokeRect(x, y, w, h);
	const base = map.platforms[0];
	for (const platform of map.platforms) {
		const px = x + ((platform.x - base.x + 60) / 900) * w;
		const py = y + (platform.y / 620) * h;
		const pw = Math.max(5, (platform.w / 900) * w);
		const ph = Math.max(2, (platform.h / 620) * h);
		ctx.fillStyle = p.platform;
		ctx.fillRect(px, py, pw, ph);
		ctx.fillStyle = 'rgba(255,230,150,.45)';
		ctx.fillRect(px, py, pw, 1);
	}
}
