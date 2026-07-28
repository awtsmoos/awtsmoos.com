// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainLayerRecipe.js
 * @description Adapts six ecological terrain sources into six stable packaged texture roles.
 * The Awtsmoos renews each semantic garment while local pixels keep their trusted name;
 * Awtsmoos.com joins source and vessel explicitly, so a refactor cannot break the meadow again.
 */

import { mountainTerrainStack } from '../materials/MountainVillageMaterialPresets.js';
import { localTerrainTextureUrl } from './LocalTerrainTextureCatalog.js';

export const TERRAIN_LAYER_COUNT = 6;

const LAYER_BINDINGS = Object.freeze({
	'forest-leaf-floor': binding('forest-leaf-floor', 'meadow-lush-grass'),
	'meadow-wet-grass': binding('meadow-wet-grass', 'meadow-base-grass'),
	'mountain-stone': binding('mountain-stone', 'mountain-exposed-stone'),
	'shore-sand': binding('shore-sand', 'meadow-road-shoulder'),
	'stream-bank-mud': binding('stream-bank-mud', 'meadow-moss-and-wet-grass'),
	'worn-earth': binding('worn-earth', 'meadow-open-soil')
});

const QUALITY_ROLES = Object.freeze({
	cinematic: Object.freeze([
		'meadow-wet-grass',
		'worn-earth',
		'stream-bank-mud',
		'mountain-stone',
		'forest-leaf-floor',
		'shore-sand'
	]),
	high: Object.freeze([
		'meadow-wet-grass',
		'worn-earth',
		'stream-bank-mud',
		'mountain-stone',
		'forest-leaf-floor',
		'shore-sand'
	]),
	low: Object.freeze([
		'meadow-wet-grass',
		'worn-earth',
		'mountain-stone'
	]),
	medium: Object.freeze([
		'meadow-wet-grass',
		'worn-earth',
		'stream-bank-mud',
		'mountain-stone',
		'forest-leaf-floor'
	])
});

/**
 * Selects a bounded quality profile while retaining current source-role provenance.
 *
 * @param {string} quality Requested rendering quality.
 * @returns {object} Frozen active layers, complete six-layer stack, and stable diagnostics.
 */
export function terrainLayerRecipe(quality = 'medium') {
	const stack = mountainTerrainStack();
	const activeRoles = QUALITY_ROLES[quality] || QUALITY_ROLES.medium;
	const layers = activeRoles.map((role) => {
		return localizedLayer(stack, requiredBinding(role));
	});

	return Object.freeze({
		activeLayerCount: layers.length,
		activeRoles,
		baseUrl: localTerrainTextureUrl('meadow-wet-grass'),
		dirtUrl: localTerrainTextureUrl('worn-earth'),
		layers: Object.freeze(layers),
		logicalLayerCount: stack.logicalLayerCount,
		pageCount: Math.ceil(stack.logicalLayerCount / layers.length),
		quality,
		shader: 'terrain-layered-six-stage-material-stack',
		stack
	});
}

function binding(role, sourceRole) {
	return Object.freeze({ role, sourceRole });
}

function requiredBinding(role) {
	const layerBinding = LAYER_BINDINGS[role];

	if (!layerBinding) {
		throw new Error(`Missing packaged terrain role: ${role}`);
	}

	return layerBinding;
}

function localizedLayer(stack, layerBinding) {
	const sourceLayer = stack.layers.find((candidate) => {
		return candidate.role === layerBinding.sourceRole;
	});

	if (!sourceLayer) {
		throw new Error(`Missing ecological terrain role: ${layerBinding.sourceRole}`);
	}

	return Object.freeze({
		...sourceLayer,
		publicUrl: sourceLayer.url,
		role: layerBinding.role,
		sourceRole: layerBinding.sourceRole,
		url: localTerrainTextureUrl(layerBinding.role)
	});
}
