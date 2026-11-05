//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowHebrewGlyphTexture.js
 * @description Resolves Hebrew projectile material identity while Procedural Core owns physical material creation.
 * Sacred stroke geometry never receives a generated canvas or naked placeholder texture: the material remains
 * remote-pending until verified Awtsmoos Drive gold imagery exists, while semantic identity and cache diagnostics
 * stay deterministic for pooling, tests, and later hydration.
 */

import {
	createNativeWorldMaterial
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';
import { runtimeMaterialByRole } from '../assets/RuntimeMaterialManifest.js';

const materialCache = new Map();

/**
 * Creates or reuses one remote-only gold material for Hebrew stroke geometry.
 * @param {string} letters Hebrew phrase used for stable pooling identity.
 * @param {number[]} color Requested RGBA modulation factor.
 * @returns {object} Core-owned physical material with verified map or pending null map.
 */
export function createHebrewGlyphMaterial(letters, color) {
	const key = hebrewGlyphVisualKey(letters, color);
	if (materialCache.has(key)) {
		return materialCache.get(key);
	}
	const identity = runtimeMaterialByRole('metal.gold');
	const cached = identity ? cachedTextureImage(identity.primaryUrl) : null;
	const mapImage = isRealMaterialImage(cached) ? cached : null;
	const material = createNativeWorldMaterial({
		color,
		mapImage,
		mapRepeat: identity?.repeat || [1, 1],
		metalness: 0.35,
		name: `Awtsmoos_hebrew_remote_gold_${key}`,
		remoteOnly: true,
		roughness: 0.44,
		semanticRole: 'metal.gold',
		texturePolicy: {
			hideUntilHydrated: true,
			realMapImage: Boolean(mapImage),
			remoteOnly: true,
			semanticRole: 'metal.gold'
		},
		textureUrl: identity?.primaryUrl || null
	});
	material.vertexColors = false;
	materialCache.set(key, material);
	return material;
}

/**
 * Creates the stable cache key for phrase plus requested tint.
 * @returns {string} Deterministic glyph-material cache key.
 */
export function hebrewGlyphVisualKey(letters, color) {
	return `${normalizeHebrewPhrase(letters)}|${Array.from(color || []).join(',')}`;
}
/**
 * Normalizes projectile text while preserving the actual Hebrew phrase.
 * @returns {string} Non-empty phrase suitable for cache identity and geometry lookup.
 */
export function normalizeHebrewPhrase(value) {
	return String(value || 'אור').trim() || 'אור';
}

/**
 * Returns bounded remote-material cache evidence without allocating generated canvases.
 * @returns {{canvases:number,materials:number,remoteOnly:boolean,renderMode:string,semanticRole:string}} Diagnostics.
 */
export function hebrewGlyphTextureDiagnostics() {
	return {
		canvases: 0,
		materials: materialCache.size,
		remoteOnly: true,
		renderMode: 'remote-textured-stroke-geometry',
		semanticRole: 'metal.gold'
	};
}

/** Compatibility name retained for callers that refer specifically to material diagnostics. */
export function hebrewGlyphMaterialDiagnostics() {
	return hebrewGlyphTextureDiagnostics();
}
