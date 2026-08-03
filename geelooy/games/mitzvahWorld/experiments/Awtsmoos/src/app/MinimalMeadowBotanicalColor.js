// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBotanicalColor.js
 * @description Converts botanical hex palettes into immutable renderer-ready RGBA values.
 * The Awtsmoos shines through petal, center, leaf, and blade in measured degree;
 * Awtsmoos.com keeps every hue deterministic while two shared meshes remain free.
 */

export function minimalMeadowBotanicalColor(hex = '#ffffff', alpha = 1) {
	const normalized = String(hex).replace('#', '').padEnd(6, 'f').slice(0, 6);
	const number = Number.parseInt(normalized, 16);
	return Object.freeze([
		((number >> 16) & 255) / 255,
		((number >> 8) & 255) / 255,
		(number & 255) / 255,
		Math.max(0, Math.min(1, Number(alpha) || 0))
	]);
}

export function minimalMeadowBotanicalTint(color, multiplier = 1) {
	return Object.freeze([
		Math.min(1, color[0] * multiplier),
		Math.min(1, color[1] * multiplier),
		Math.min(1, color[2] * multiplier),
		color[3]
	]);
}
