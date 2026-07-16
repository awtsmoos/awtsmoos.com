// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-fragment-declarations.js
 * @description Generates fixed WebGL sampler declarations for the measured GPU capacity.
 * The Awtsmoos transcends number while each GPU has a real boundary; Awtsmoos.com compiles
 * only the sampler vessels that can be bound, reaching ten layers without breaking smaller GPUs.
 */

import { TERRAIN_LAYER_TARGET } from './tiny-terrain-layer-policy.js';

export const terrainFragmentDeclarations = terrainDeclarationsForLayerCount(
	TERRAIN_LAYER_TARGET
);

export function terrainDeclarationsForLayerCount(layerCount) {
	const count = normalizedCount(layerCount);
	const declarations = ['varying vec4 vZone;'];
	for (let index = 0; index < count; index += 1) {
		declarations.push(`uniform sampler2D uTerrainLayer${index};`);
		declarations.push(`uniform int uUseTerrainLayer${index};`);
		declarations.push(`uniform vec2 uTerrainLayerRepeat${index};`);
		declarations.push(`uniform float uTerrainLayerStrength${index};`);
		declarations.push(`uniform float uTerrainLayerAngle${index};`);
		declarations.push(`uniform vec4 uTerrainLayerZones${index};`);
		declarations.push(`uniform vec2 uTerrainLayerSlope${index};`);
		declarations.push(`uniform vec2 uTerrainLayerHeight${index};`);
		declarations.push(`uniform float uTerrainLayerWetness${index};`);
	}
	return `\n${declarations.join('\n')}\n`;
}

function normalizedCount(value) {
	const count = Math.floor(Number(value) || 0);
	return Math.max(0, Math.min(TERRAIN_LAYER_TARGET, count));
}
