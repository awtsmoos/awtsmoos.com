// B"H

export const WORLD_THEME = Object.freeze({
	void: '#07131a',
	ink: '#f6f3df',
	shadow: 'rgba(3, 10, 14, 0.48)',
	grass: '#5f9f55',
	path: '#caa76a',
	water: '#3c8cad',
	stone: '#7b8586',
	sand: '#c8a86c',
	mystic: '#6d5ca8',
	interaction: '#ffd96a',
	cyan: '#69e9ef'
});

export const EMOJI_FONT = "'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";

export function viewportOf(ctx) {
	return {
		width: ctx.canvas.__logicalWidth || ctx.canvas.clientWidth || ctx.canvas.width,
		height: ctx.canvas.__logicalHeight || ctx.canvas.clientHeight || ctx.canvas.height
	};
}

export function prepareRenderingContext(ctx) {
	const dpr = ctx.canvas.__dpr || 1;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.imageSmoothingEnabled = false;
}

export function stableHash(value = '') {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
