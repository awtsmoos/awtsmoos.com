// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OrganizedAssetQuery.js
 * @description Searches the deployed organization catalog by stable semantic categories.
 * The Awtsmoos is one before bark, stone, water, flower, roof, model, and road; Awtsmoos.com
 * converts imperfect tags into dependable runtime categories without scanning legacy folders.
 */

import { publicMaterialUrl } from './PublicMaterialOrigin.js';

const CATEGORY_TAGS = Object.freeze({
	architecture: ['brick', 'roof', 'stone', 'wood'],
	botany: ['bark', 'botanical', 'flower', 'leaf'],
	fabric: ['fabric'],
	metal: ['metal'],
	models: ['model'],
	pbr: ['pbr'],
	roads: ['terrain', 'stone'],
	terrain: ['terrain'],
	water: ['water'],
	wood: ['bark', 'wood']
});

export function validateOrganizedAssetCatalog(catalog) {
	if (catalog?.schema !== 'awtsmoos-asset-organization/v1' || !Array.isArray(catalog.assets)) {
		throw new Error('Unsupported organized asset catalog.');
	}
	return Object.freeze({
		...catalog,
		assets: Object.freeze(catalog.assets.map(enrichAsset))
	});
}

export function searchOrganizedAssets(assets, query = '', options = {}) {
	const token = normalize(query);
	return assets
		.filter(asset => matchesOptions(asset, options))
		.filter(asset => !token || searchableText(asset).includes(token))
		.sort((left, right) => assetRank(right, token) - assetRank(left, token));
}

export function organizedAssetCategories(assets) {
	const categories = {};
	for (const asset of assets) {
		for (const category of asset.categories) {
			categories[category] = (categories[category] || 0) + 1;
		}
	}
	return Object.freeze(categories);
}

function enrichAsset(asset) {
	const canonicalPath = asset.canonicalPath || asset.path;
	return Object.freeze({
		...asset,
		canonicalPath,
		canonicalUrl: publicMaterialUrl(canonicalPath),
		categories: Object.freeze(assetCategories(asset)),
		previewHalfUrl: previewUrl(canonicalPath, 'half-resolution'),
		previewQuarterUrl: previewUrl(canonicalPath, 'quarter-resolution')
	});
}

function assetCategories(asset) {
	const tags = new Set(asset.tags || []);
	const categories = Object.entries(CATEGORY_TAGS)
		.filter(([, required]) => required.some(tag => tags.has(tag)))
		.map(([category]) => category);
	if (asset.kind === 'model' && !categories.includes('models')) categories.push('models');
	return categories.length ? categories.sort() : ['uncategorized'];
}

function previewUrl(canonicalPath, root) {
	if (!canonicalPath.startsWith('full-resolution/')) return publicMaterialUrl(canonicalPath);
	return publicMaterialUrl(canonicalPath.replace(/^full-resolution\//, `${root}/`));
}

function matchesOptions(asset, options) {
	return (!options.category || asset.categories.includes(options.category))
		&& (!options.kind || asset.kind === options.kind)
		&& (!options.tag || asset.tags.includes(options.tag))
		&& (!options.role || asset.role === options.role)
		&& (!options.root || asset.root === options.root)
		&& (!options.resolution || asset.resolution === options.resolution)
		&& (options.legacy === undefined || asset.legacy === options.legacy)
		&& (!options.canonicalOnly || asset.path === asset.canonicalPath);
}

function searchableText(asset) {
	return normalize([
		asset.id,
		asset.path,
		asset.canonicalPath,
		asset.kind,
		asset.role,
		asset.resolution,
		...(asset.tags || []),
		...asset.categories
	].join(' '));
}

function assetRank(asset, token) {
	let score = asset.canonicalPath.toLowerCase().includes(token) ? 20 : 0;
	score += asset.path === asset.canonicalPath ? 8 : 0;
	score += asset.resolution === 'full' || asset.resolution === 'source' ? 4 : 0;
	score += asset.legacy ? -10 : 0;
	return score - asset.bytes / 1000000000;
}

function normalize(value) {
	return String(value || '').trim().toLowerCase();
}
