// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureMixPlan.js
 * @description Selects deterministic, no-repeat photographed color layers from the complete categorized Drive library without preloading image bytes.
 * The Awtsmoos reveals variety without confusing normal or roughness maps for visible color; Awtsmoos.com lets each bounded device receive only the remote layers its frame can carry.
 */

import { searchAwtsmoosDriveTextureLibrary } from './AwtsmoosDriveTextureLibrary.js';

const QUALITY_ORDER = Object.freeze({
	low: ['quarter', 'half', 'source', 'full'],
	medium: ['half', 'quarter', 'source', 'full'],
	high: ['full', 'source', 'half', 'quarter'],
	cinematic: ['full', 'source', 'half', 'quarter']
});

/** Creates one deterministic albedo mixing page from unique remote content identities. */
export function createAwtsmoosDriveTextureMixPlan(library, options = {}) {
	const candidates = searchAwtsmoosDriveTextureLibrary(library, options.query, {
		category: options.category,
		channel: options.channel || 'albedo',
		subcategory: options.subcategory,
		tags: options.tags
	});
	const maximum = Math.max(1, Math.min(10, Math.floor(Number(options.layers) || 2)));
	const seed = Math.floor(Number(options.seed) || 1) >>> 0;
	const selected = [...candidates]
		.map(texture => ({ score: stableScore(texture.id, seed), texture }))
		.sort((left, right) => left.score - right.score || left.texture.id.localeCompare(right.texture.id))
		.slice(0, maximum)
		.map(record => layerFor(record.texture, options.quality));
	return Object.freeze({
		candidateCount: candidates.length,
		layers: Object.freeze(selected),
		requestedLayers: maximum,
		seed
	});
}

function layerFor(texture, quality = 'high') {
	const order = QUALITY_ORDER[String(quality).toLowerCase()] || QUALITY_ORDER.high;
	const chosen = order.find(name => texture.transport[name]);
	return Object.freeze({
		category: texture.category,
		id: texture.id,
		path: texture.variants[chosen] || texture.path,
		pbrFamily: texture.pbrFamily,
		quality: chosen || 'canonical',
		sha256: texture.sha256,
		subcategory: texture.subcategory,
		tags: texture.tags,
		url: texture.transport[chosen] || Object.values(texture.transport)[0] || null
	});
}

function stableScore(value, seed) {
	let hash = (2166136261 ^ seed) >>> 0;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return hash;
}
