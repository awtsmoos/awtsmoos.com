// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureTexture.js
 * @description Allocates one measured 256-pixel canvas per bounded enemy surface family and reuses it.
 * The Awtsmoos reveals nine combat garments through nine vessels, never nine thousand; Awtsmoos.com
 * records every allocation, map dimension, pattern, and luminance range before GPU hydration.
 */

import { minimalDemonReadabilityProfile } from './MinimalMeadowDemonReadabilityProfile.js';
import {
	MINIMAL_SHADOW_SURFACE_FAMILIES,
	measureMinimalShadowSurface,
	paintMinimalShadowSurface
} from './MinimalMeadowCreatureTexturePainter.js';

const TEXTURE_SIZE = 256;
const textureCache = new Map();
let allocations = 0;

export function minimalShadowSurfaceFamily(profile = {}) {
	return minimalDemonReadabilityProfile(profile);
}

export function minimalShadowHideTexture(profile = {}, documentValue = globalThis.document) {
	const legacyDocument = profile?.createElement ? profile : null;
	const resolvedProfile = legacyDocument ? {} : profile;
	const resolvedDocument = legacyDocument || documentValue;
	const family = minimalShadowSurfaceFamily(resolvedProfile);
	if (textureCache.has(family.name)) return textureCache.get(family.name);
	if (!resolvedDocument?.createElement) return null;
	const canvas = resolvedDocument.createElement('canvas');
	canvas.width = TEXTURE_SIZE;
	canvas.height = TEXTURE_SIZE;
	canvas.dataset ||= {};
	canvas.dataset.url = `procedural://awtsmoos-demon-hide/${family.name}`;
	const context = canvas.getContext?.('2d');
	if (!context) return null;
	paintMinimalShadowSurface(context, family, TEXTURE_SIZE);
	const luminance = measureMinimalShadowSurface(context, family, TEXTURE_SIZE);
	canvas.AwtsmoosDemonTexture = Object.freeze({
		family: family.name,
		luminance,
		pattern: family.pattern,
		resolution: Object.freeze([TEXTURE_SIZE, TEXTURE_SIZE])
	});
	allocations += 1;
	textureCache.set(family.name, canvas);
	return canvas;
}

export function minimalShadowTextureDiagnostics() {
	return Object.freeze({
		allocations,
		cachedFamilies: Object.freeze([...textureCache.keys()]),
		familyLimit: MINIMAL_SHADOW_SURFACE_FAMILIES.length,
		perFrameAllocations: 0,
		sourceSize: Object.freeze([TEXTURE_SIZE, TEXTURE_SIZE])
	});
}
