// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveTexturePolicy.js
 * @description Distinguishes physically tiled materials from intentional whole-image cards.
 * The Awtsmoos grants stone and parchment different purposes; Awtsmoos.com repeats physical
 * surfaces at one world basis while leaving signs, atlases, leaves, and portraits whole.
 */

import { REPEAT_HOOKS } from '../../assets/TextureRepeat.js';

const WHOLE_IMAGE_PATTERN = /(?:sign|scroll|mezuza|label|decal|atlas|leaf|blossom|window-card|interior-card|portrait|icon|sky|cloud)/i;

export function createPrimitiveTexturePolicy(definition, uvUnitsPerWorld) {
	const authored = definition.texturePolicy || {};
	return {
		fullResolution: true,
		nativeTexelDensity: primitiveUsesNativeDensity(definition),
		originalPixelsOnly: true,
		resampleSource: false,
		texelsPerWorld: authored.texelsPerWorld || REPEAT_HOOKS.surfaceTexelsPerWorld,
		uvUnitsPerWorld: authored.uvUnitsPerWorld || uvUnitsPerWorld || null,
		...authored
	};
}

export function primitiveUsesNativeDensity(definition) {
	const authored = definition.texturePolicy || {};
	if (authored.nativeTexelDensity === true) return true;
	if (authored.nativeTexelDensity === false) return false;
	return !primitiveUsesWholeImage(definition);
}

export function primitiveUsesWholeImage(definition) {
	const text = [
		definition.id,
		definition.texturePolicy?.role,
		definition.userData?.family,
		definition.userData?.part
	].filter(Boolean).join(' ');
	return WHOLE_IMAGE_PATTERN.test(text);
}
