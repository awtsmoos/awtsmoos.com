// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.js
 * @description Selects biome-diverse active roles from a sixteen-source alpine ground covenant.
 * The Awtsmoos reveals one valley through meadow, earth, wet bank, rock, forest, and shore;
 * Awtsmoos.com serves first-view terrain locally while preserving the complete authored stack.
 */

import { mountainTerrainStack } from '../materials/MountainVillageMaterialPresets.js';
import { localTerrainTextureUrl } from './LocalTerrainTextureCatalog.js';

export const TERRAIN_LAYER_COUNT = 16;

const QUALITY_ROLES = Object.freeze({
	low: Object.freeze([
		'meadow-source-grass',
		'worn-earth',
		'mountain-stone'
	]),
	medium: Object.freeze([
		'meadow-wet-grass',
		'worn-earth',
		'stream-bank-mud',
		'mountain-stone',
		'forest-leaf-floor'
	]),
	high: Object.freeze([
		'meadow-wet-grass',
		'worn-earth',
		'stream-bank-mud',
		'mountain-stone',
		'forest-leaf-floor',
		'shore-sand'
	]),
	cinematic: Object.freeze([
		'meadow-wet-grass',
		'worn-earth',
		'stream-bank-mud',
		'mountain-stone',
		'forest-leaf-floor',
		'shore-sand'
	])
});

export function terrainLayerRecipe(quality = 'medium') {
	const stack = mountainTerrainStack();
	const activeRoles = QUALITY_ROLES[quality] || QUALITY_ROLES.medium;
	const layers = activeRoles.map(role => localizeLayer(requiredLayer(stack, role)));
	return Object.freeze({
		activeLayerCount: layers.length,
		activeRoles,
		baseUrl: localTerrainTextureUrl('meadow-source-grass'),
		dirtUrl: localTerrainTextureUrl('worn-earth'),
		layers: Object.freeze(layers),
		logicalLayerCount: stack.logicalLayerCount,
		pageCount: Math.ceil(stack.logicalLayerCount / layers.length),
		quality,
		shader: 'terrain-layered-six-stage-material-stack',
		stack
	});
}

function requiredLayer(stack, role) {
	const layer = stack.layers.find(candidate => candidate.role === role);
	if (!layer) throw new Error(`Missing canonical terrain role: ${role}`);
	return layer;
}

function localizeLayer(layer) {
	return Object.freeze({
		...layer,
		publicUrl: layer.url,
		url: localTerrainTextureUrl(layer.role)
	});
}
