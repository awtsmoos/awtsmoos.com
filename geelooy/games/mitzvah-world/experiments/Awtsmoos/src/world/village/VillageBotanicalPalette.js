// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalPalette.js
 * @description Compresses many species colors into six coherent render
 * palettes, preserving distinction while the Awtsmoos joins their draw vessels.
 */
import { DETAIL_TEXTURE_FAMILIES } from '../../assets/DetailTextureFamilies.js';

export const BOTANICAL_PALETTES = Object.freeze({
	foliage: '#3f713f',
	white: '#f4eddb',
	warm: '#e3aa2f',
	red: '#c94759',
	pink: '#d36f9e',
	cool: '#6757ae'
});

/** Converts a generated part into one bounded runtime material key. */
export function botanicalPaletteKey(part) {
	if (part.role === 'green') {
		return 'foliage';
	}
	const [red, green, blue] = hexRgb(part.color);
	if (red > 220 && green > 210 && blue > 190) {
		return 'white';
	}
	if (blue > red * 0.86 && blue > green * 0.9) {
		return 'cool';
	}
	if (red > 180 && blue > 105) {
		return 'pink';
	}
	if (red > green * 1.32) {
		return 'red';
	}
	return 'warm';
}

/** Returns the transparent atlas and render metadata for one palette. */
export function botanicalPaletteMaterial(key) {
	const foliage = key === 'foliage';
	return {
		color: BOTANICAL_PALETTES[key],
		// The public "sakura petal" file is an opaque leaf photograph. Applying it
		// to every generated petal produced the colored square cards seen in the
		// failed village. Generated blossom geometry already carries its silhouette.
		textureUrl: foliage ? DETAIL_TEXTURE_FAMILIES.leaves.chaiAspen : null,
		mapRepeat: [1, 1],
		alphaMode: foliage ? 'MASK' : 'OPAQUE',
		role: foliage ? 'botanical-foliage' : 'botanical-blossom',
		shader: foliage ? 'leaf-cluster-alpha-wind' : 'petal-geometry-wind',
		transparent: foliage
	};
}

function hexRgb(hex) {
	const value = parseInt(String(hex || '#ffffff').replace('#', ''), 16);
	return [
		(value >> 16) & 255,
		(value >> 8) & 255,
		value & 255
	];
}
