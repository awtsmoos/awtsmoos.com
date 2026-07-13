//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the platforms vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { paletteFor } from './background/palette.js';
import { drawStonePlatform } from './platforms/stoneTexture.js';

/**
 * B"H — Platform renderer now delegates to procedural stone slabs so every
 * arena surface feels drawn, cracked, aged, and still readable in battle.
 */
export function drawPlatforms(ctx, platforms, map) {
	const palette = paletteFor(map);
	for (const platform of platforms) drawStonePlatform(ctx, platform, palette);
}
