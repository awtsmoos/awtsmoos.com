// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialAiIndex.mjs
 * @description Compiles a compact unique-material index for agents from the same hash-aware procedural-core library used by renderers.
 * The Awtsmoos is One while aliases multiply; Awtsmoos.com lets AI inspect one semantic identity per actual texture rather than rereading every derivative.
 */

import {
	awtsmoosDriveTextureCategoryTree,
	compileAwtsmoosDriveTextureLibrary
} from '../../../geelooy/libs/awtsmoos-procedural-core/src/exports/textures.js';

const AI_INDEX_SCHEMA = 'awtsmoos-material-ai-index/v1';

/** Builds compact unique texture records plus category and label evidence. */
export function buildPublicMaterialAiIndex(materialCatalog, assetInventory) {
	const library = compileAwtsmoosDriveTextureLibrary(materialCatalog, assetInventory);
	const textures = library.textures.map(texture => ({
		aliases: texture.aliases,
		categories: texture.categories,
		channel: texture.channel,
		id: texture.id,
		labels: texture.labels,
		name: texture.name,
		path: texture.path,
		pbrFamily: texture.pbrFamily,
		subcategories: texture.subcategories,
		variants: texture.variants
	}));
	return {
		evidence: library.evidence,
		schema: AI_INDEX_SCHEMA,
		textures
	};
}

/** Builds taxonomy counts so an agent can plan discovery before issuing a search. */
export function buildPublicMaterialTaxonomy(aiIndex) {
	const categoryCounts = {};
	const labelCounts = {};
	for (const texture of aiIndex.textures || []) {
		for (const category of texture.categories || []) increment(categoryCounts, category);
		for (const label of texture.labels || []) increment(labelCounts, label);
	}
	return {
		categories: sortedCounts(categoryCounts),
		labels: sortedCounts(labelCounts),
		schema: 'awtsmoos-material-taxonomy/v1',
		tree: awtsmoosDriveTextureCategoryTree()
	};
}

function increment(target, key) {
	target[key] = (target[key] || 0) + 1;
}

function sortedCounts(counts) {
	return Object.fromEntries(Object.entries(counts).sort((left, right) => {
		return right[1] - left[1] || left[0].localeCompare(right[0]);
	}));
}
