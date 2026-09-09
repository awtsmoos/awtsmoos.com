// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureLibrary.js
 * @description Collapses the complete Drive catalog into unique hash identities enriched with PBR, taxonomy, aliases, and quality variants.
 * The Awtsmoos is One while finite paths multiply; Awtsmoos.com keeps one runtime identity per pictured garment and gives AI a truthful semantic address for every surface.
 */

import { awtsmoosDriveTexturePathUrl } from './AwtsmoosDriveTextureTransport.js';
import { classifyAwtsmoosDriveTexture } from './AwtsmoosDriveTextureCategories.js';
import {
	awtsmoosDrivePbrFamilyKey,
	awtsmoosDriveTextureChannel
} from './AwtsmoosDriveTextureChannels.js';

/** Compiles all image records into one no-repeat semantic texture library. */
export function compileAwtsmoosDriveTextureLibrary(materialCatalog, assetInventory) {
	const materials = (materialCatalog?.records || []).filter(record => record?.kind === 'image');
	const assets = (assetInventory?.assets || []).filter(record => record?.kind === 'image');
	const inventoryByPath = new Map(assets.map(record => [record.path, record]));
	const logicalGroups = groupBy(materials, record => record.variantKey || record.path);
	const logical = [...logicalGroups.values()].map(records => logicalTexture(records, inventoryByPath));
	const contentGroups = groupBy(logical, record => record.sha256 || `logical:${record.variantKey}`);
	const textures = [...contentGroups.values()].map(mergeContentIdentity).sort(compareTexture);
	const physicalHashes = groupBy(assets.filter(asset => asset.sha256), asset => asset.sha256);
	return Object.freeze({
		evidence: Object.freeze({
			categories: categoryCounts(textures),
			duplicatePhysicalRecords: assets.length - physicalHashes.size,
			logicalVariantGroups: logical.length,
			physicalImageRecords: assets.length,
			uniquePhysicalHashes: physicalHashes.size,
			uniqueTextures: textures.length
		}),
		textures: Object.freeze(textures)
	});
}

/** Searches unique textures by text plus optional category, subcategory, channel, and tags. */
export function searchAwtsmoosDriveTextureLibrary(library, query = '', options = {}) {
	const needle = normalize(query);
	const tags = new Set((options.tags || []).map(normalize).filter(Boolean));
	return Object.freeze((library?.textures || []).filter(texture => {
		if (options.category && texture.category !== options.category) return false;
		if (options.subcategory && texture.subcategory !== options.subcategory) return false;
		if (options.channel && texture.channel !== options.channel) return false;
		const tagSet = new Set(texture.tags.map(normalize));
		if ([...tags].some(tag => !tagSet.has(tag))) return false;
		return !needle || searchable(texture).includes(needle);
	}));
}

function logicalTexture(records, inventoryByPath) {
	const ordered = [...records].sort((left, right) => materialRank(left, inventoryByPath) - materialRank(right, inventoryByPath));
	const primary = ordered[0];
	const inventory = inventoryByPath.get(primary.path) || {};
	return {
		aliases: unique(ordered.flatMap(record => [record.path, record.variantKey])),
		alphaCapable: Boolean(primary.alphaCapable),
		bytes: Number(inventory.bytes || primary.bytes || 0),
		height: Number(primary.height || 0),
		name: primary.name,
		path: primary.path,
		sha256: inventory.sha256 || null,
		tags: unique(ordered.flatMap(record => record.tags || [])),
		variantKey: primary.variantKey || primary.path,
		variants: Object.assign({}, ...ordered.map(record => record.variants || {})),
		width: Number(primary.width || 0)
	};
}

function mergeContentIdentity(records) {
	const primary = [...records].sort((a, b) => pathRank(a.path) - pathRank(b.path))[0];
	const variants = Object.assign({}, ...records.map(record => record.variants || {}));
	const classification = classifyAwtsmoosDriveTexture(primary);
	const channel = awtsmoosDriveTextureChannel(primary);
	return Object.freeze({
		...primary,
		...classification,
		aliases: Object.freeze(unique(records.flatMap(record => record.aliases))),
		channel,
		id: primary.sha256 ? `sha256:${primary.sha256}` : `texture:${primary.variantKey}`,
		pbrFamily: awtsmoosDrivePbrFamilyKey(primary),
		tags: Object.freeze(unique(records.flatMap(record => record.tags))),
		transport: Object.freeze(Object.fromEntries(Object.entries(variants).map(([quality, path]) => [quality, awtsmoosDriveTexturePathUrl(path)]))),
		variants: Object.freeze(variants)
	});
}

function materialRank(record, inventoryByPath) {
	const asset = inventoryByPath.get(record.path) || {};
	const role = asset.role === 'canonical-source' ? 0 : asset.legacy ? 30 : 10;
	return role + ({ source: 0, full: 1, half: 2, quarter: 3 }[record.resolution] ?? 8) + pathRank(record.path) / 10000;
}
function categoryCounts(textures) { const counts = {}; for (const texture of textures) counts[texture.category] = (counts[texture.category] || 0) + 1; return Object.freeze(counts); }
function pathRank(path = '') { return path.startsWith('full-resolution/') || path.startsWith('awtsmoos-nature/') ? path.length : 1000 + path.length; }
function compareTexture(left, right) { return left.path.localeCompare(right.path); }
function normalize(value) { return String(value || '').trim().toLowerCase(); }
function searchable(texture) { return normalize([texture.name, texture.path, texture.category, texture.subcategory, texture.channel, ...texture.aliases, ...texture.tags].join(' ')); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function groupBy(values, keyFor) { const groups = new Map(); for (const value of values) { const key = keyFor(value); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(value); } return groups; }
