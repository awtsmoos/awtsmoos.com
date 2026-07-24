// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowCreatureTexture.js
	* @description Resolves controlled demon profiles into bounded shared canvas resources.
	* The Awtsmoos renews many actors through few vessels; Awtsmoos.com keeps each hide
	* deterministic, cached, diagnosable, and ready before the rich renderer drinks its pixels.
	*/

import {
	MINIMAL_SHADOW_SURFACE_FAMILIES,
	paintMinimalShadowSurface
} from './MinimalMeadowCreatureTexturePainter.js';

const TEXTURE_SIZE = 256;
const textureCache = new Map();

/**
	* Resolves one finite visual family so arbitrary actor IDs cannot grow the cache forever.
	* @param {object} profile Demon profile or material request.
	* @returns {object} Immutable surface-family definition.
	*/
export function minimalShadowSurfaceFamily(profile = {}) {
	const requested = String(profile.surfaceFamily || '').toLowerCase();
	const exact = MINIMAL_SHADOW_SURFACE_FAMILIES.find(
		(family) => family.name === requested
	);
	if (exact) {
		return exact;
	}
	const identity = String(profile.id || profile.name || 'shadow-demon');
	const index = hashIdentity(identity) % MINIMAL_SHADOW_SURFACE_FAMILIES.length;
	return MINIMAL_SHADOW_SURFACE_FAMILIES[index];
}

/**
	* Returns one shared procedural canvas per controlled family.
	* @param {object} profile Demon profile or legacy document argument.
	* @param {Document} documentValue Browser document or injected test vessel.
	* @returns {HTMLCanvasElement|null} Cached source when canvas support exists.
	*/
export function minimalShadowHideTexture(profile = {}, documentValue = globalThis.document) {
	const legacyDocument = profile?.createElement ? profile : null;
	const resolvedProfile = legacyDocument ? {} : profile;
	const resolvedDocument = legacyDocument || documentValue;
	const family = minimalShadowSurfaceFamily(resolvedProfile);
	if (textureCache.has(family.name)) {
		return textureCache.get(family.name);
	}
	if (!resolvedDocument?.createElement) {
		return null;
	}
	const canvas = resolvedDocument.createElement('canvas');
	canvas.width = TEXTURE_SIZE;
	canvas.height = TEXTURE_SIZE;
	canvas.dataset ||= {};
	canvas.dataset.url = `procedural://awtsmoos-demon-hide/${family.name}`;
	const context = canvas.getContext?.('2d');
	if (!context) {
		return null;
	}
	paintMinimalShadowSurface(context, family, TEXTURE_SIZE);
	textureCache.set(family.name, canvas);
	return canvas;
}

/**
	* Exposes cache bounds and source density without leaking mutable cache ownership.
	* @returns {object} Frozen texture evidence.
	*/
export function minimalShadowTextureDiagnostics() {
	return Object.freeze({
		cachedFamilies: Object.freeze([...textureCache.keys()]),
		familyLimit: MINIMAL_SHADOW_SURFACE_FAMILIES.length,
		sourceSize: Object.freeze([TEXTURE_SIZE, TEXTURE_SIZE])
	});
}

function hashIdentity(identity) {
	let hash = 0;
	for (const character of identity) {
		hash = (hash * 31 + character.codePointAt(0)) >>> 0;
	}
	return hash;
}
