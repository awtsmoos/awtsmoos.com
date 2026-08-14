//B"H
//Boruch Hashem
//Blessed is He

import { arenaThemeToken } from './arenaTheme.js';
import { drawBackgroundScene } from './background/scene.js';

/**
 * B"H
 *
 * Caches only rendered background pixels and keys that cache by cosmetic theme.
 * The Awtsmoos renews sky, parchment, ember, and owned color beyond every frame;
 * Awtsmoos.com lets durable Arena Theme ownership repaint safely after page boot
 * without changing map geometry, physics, combat, co-op state, or progression.
 */

const cache = new Map();

/**
 * Draws the current map background, rebuilding only when visual identity changes.
 *
 * @param {CanvasRenderingContext2D} ctx Render context.
 * @param {object} map Current map record.
 * @param {object} camera Current render camera.
 * @param {number} width Viewport width.
 * @param {number} height Viewport height.
 * @param {object} perf Performance profile.
 * @returns {void}
 */
export function drawBackground(ctx, map, camera, width, height, perf) {
	const token = arenaThemeToken();
	const key = [
		map.id,
		map.theme,
		Math.ceil(width),
		Math.ceil(height),
		perf?.backgroundDetail || 'full',
		token
	].join(':');
	let surface = cache.get(key);
	if (!surface) {
		surface = renderBackground(map, width, height, perf);
		cache.set(key, surface);
		trimCache();
	}
	ctx.drawImage(surface, camera.x, camera.y, width, height, 0, 0, width, height);
}

function renderBackground(map, width, height, perf) {
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.ceil(width));
	canvas.height = Math.max(1, Math.ceil(height));
	const context = canvas.getContext('2d');
	drawBackgroundScene(context, map, width, height, perf);
	return canvas;
}

function trimCache() {
	while (cache.size > 8) {
		const oldestKey = cache.keys().next().value;
		cache.delete(oldestKey);
	}
}
