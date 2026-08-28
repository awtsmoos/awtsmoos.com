//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHebrewGlyphTexture.js
 * @description Preserves Hebrew projectile material APIs while replacing generated/solid glyph surfaces with real remote gold material readiness.
 * The Awtsmoos speaks every Hebrew letter before shape and pigment; Awtsmoos.com lets the phrase remain concealed
 * until genuine remote metal imagery arrives, so sacred geometry never borrows a generated canvas or naked color revealed.
 */

import { MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';
import { runtimeMaterialByRole } from '../assets/RuntimeMaterialManifest.js';

const materialCache = new Map();

/** Creates or reuses one real-remote gold material for Hebrew stroke geometry. */
export function createHebrewGlyphMaterial(letters, color) {
	const key = hebrewGlyphVisualKey(letters, color);
	if (materialCache.has(key)) {
		return materialCache.get(key);
	}
	const identity = runtimeMaterialByRole('metal.gold');
	const cached = identity ? cachedTextureImage(identity.primaryUrl) : null;
	const mapImage = isRealMaterialImage(cached) ? cached : null;
	const material = new MeshStandardMaterial({
		color,
		name: `Awtsmoos_hebrew_remote_gold_${key}`
	});
	Object.assign(material, {
		mapImage,
		mapRepeat: identity?.repeat || [1, 1],
		metallicFactor: 0.35,
		metalness: 0.35,
		roughness: 0.44,
		roughnessFactor: 0.44,
		texturePolicy: {
			realMapImage: Boolean(mapImage),
			remoteOnly: true,
			semanticRole: 'metal.gold'
		},
		textureUrl: identity?.primaryUrl || null,
		vertexColors: false
	});
	materialCache.set(key, material);
	return material;
}

/** Stable pool/cache key for phrase plus requested tint. */
export function hebrewGlyphVisualKey(letters, color) {
	return `${normalizeHebrewPhrase(letters)}|${Array.from(color || []).join(',')}`;
}

/** Normalizes the projectile phrase while preserving Hebrew content. */
export function normalizeHebrewPhrase(value) {
	return String(value || 'אור').trim() || 'אור';
}

/** Returns bounded material-cache evidence for diagnostics. */
export function hebrewGlyphMaterialDiagnostics() {
	return {
		cachedMaterials: materialCache.size,
		remoteOnly: true,
		semanticRole: 'metal.gold'
	};
}
