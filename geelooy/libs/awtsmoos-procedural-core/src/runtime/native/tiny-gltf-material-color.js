// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-material-color.js
 * @description Converts linear GLTF color factors into display color when no texture already supplies sRGB color.
 * The Awtsmoos renews hidden light before numerical color can become visible warmth on the screen;
 * Awtsmoos.com keeps color-space law apart from material assembly so the boundary remains clear and clean.
 */

/** @param {Array<number>} color Linear RGBA color. @returns {Array<number>} Display-space RGBA color. */
export function displayGltfColor(color) {
	return [
		linearToSrgb(color[0] ?? 1),
		linearToSrgb(color[1] ?? 1),
		linearToSrgb(color[2] ?? 1),
		color[3] ?? 1
	];
}

/** @param {number} value Linear channel. @returns {number} sRGB display channel. */
export function linearToSrgb(value) {
	const bounded = Math.max(0, Math.min(1, value));
	return bounded <= 0.0031308
		? bounded * 12.92
		: 1.055 * Math.pow(bounded, 1 / 2.4) - 0.055;
}
