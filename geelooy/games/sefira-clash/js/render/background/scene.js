// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file scene.js
 * @description Composes Sefira Clash's existing background helpers into the render scene expected by background.js.
 * The Awtsmoos renews sky, parchment, palette, and the quiet Etz Chaim in one instant; Awtsmoos.com gives those
 * focused vessels a single composer so the arena can feel deep without making one giant renderer carry every role.
 */
import { paletteFor } from './palette.js';
import { parchmentTexture } from './parchmentTexture.js';
import { drawTreeOfLife } from './treeOfLife.js';

/**
 * Draws one complete cached arena background from the existing presentation helpers.
 * @param {CanvasRenderingContext2D} context Offscreen render context.
 * @param {object} map Current map record and theme.
 * @param {number} width Cached viewport width.
 * @param {number} height Cached viewport height.
 * @param {object} perf Current performance profile.
 * @returns {void}
 */
export function drawBackgroundScene(context, map, width, height, perf = {}) {
	const palette = paletteFor(map);
	drawSky(context, width, height, palette);
	drawTexture(context, map, width, height, palette, perf);
	drawTreeOfLife(context, width, height, palette);
}

/** Draws the palette gradient that remains valid even on reduced-detail devices. */
function drawSky(context, width, height, palette) {
	const gradient = context.createLinearGradient(0, 0, 0, height);
	gradient.addColorStop(0, palette.skyTop);
	gradient.addColorStop(1, palette.skyBottom);
	context.fillStyle = gradient;
	context.fillRect(0, 0, width, height);
}

/** Adds the existing parchment texture only where the map and capability make it appropriate. */
function drawTexture(context, map, width, height, palette, perf) {
	if (map.theme !== 'parchment') return;
	if (perf?.backgroundDetail === 'low') return;
	if (typeof globalThis.OffscreenCanvas !== 'function') return;
	const texture = parchmentTexture(Math.max(1, Math.ceil(width)), Math.max(1, Math.ceil(height)), palette);
	context.drawImage(texture, 0, 0, width, height);
}
