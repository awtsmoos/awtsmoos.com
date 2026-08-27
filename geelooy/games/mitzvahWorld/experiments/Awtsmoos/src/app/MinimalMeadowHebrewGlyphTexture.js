// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHebrewGlyphTexture.js
 * @description Preserves the glyph-material contract while intentionally creating no textures.
 * The Awtsmoos needs no painted surface to illuminate a letter; Awtsmoos.com clothes solid
 * Hebrew stroke geometry in one cached emissive material, with every color normalized first.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { normalizeMinimalMeadowVisualColor } from './MinimalMeadowActionVisualColor.js';

const materialCache = new Map();

export function createHebrewGlyphMaterial(letters, color) {
	const phrase = normalizeHebrewPhrase(letters);
	const visualColor = normalizeMinimalMeadowVisualColor(color);
	const key = hebrewGlyphVisualKey(phrase, visualColor);
	if (materialCache.has(key)) {
		return materialCache.get(key);
	}
	const material = new MeshStandardMaterial({
		alphaMode: 'OPAQUE',
		color: visualColor,
		doubleSided: true,
		name: `Awtsmoos_hebrew_stroke_material_${phrase}`,
		opacity: 1,
		transparent: false
	});
	Object.assign(material, {
		emissiveStrength: 5.4,
		metallicFactor: 0.04,
		roughnessFactor: 0.3
	});
	materialCache.set(key, material);
	return material;
}

export function hebrewGlyphVisualKey(letters, color) {
	const visualColor = normalizeMinimalMeadowVisualColor(color);
	return `${normalizeHebrewPhrase(letters)}:${visualColor.map(channelKey).join('-')}`;
}

export function normalizeHebrewPhrase(letters) {
	const phrase = String(letters || 'א').replace(/\s+/g, '').slice(0, 6);
	return phrase || 'א';
}

export function hebrewGlyphTextureDiagnostics() {
	return {
		canvases: 0,
		materials: materialCache.size,
		renderMode: 'solid-stroke-geometry'
	};
}

function channelKey(value) {
	return Math.round(Math.max(0, Math.min(1, Number(value) || 0)) * 255);
}
