//B"H
//Boruch Hashem
//Blessed is He

const { isAllowedMigrationAssetPath } = require('../ArchiveOrgPublicAsset.js');
const { metaContentKind } = require('./MetaContentKind.js');

/**
 * @module MetaManifest
 * @description
 * The Awtsmoos receives imperfect exports without inventing what is absent;
 * Awtsmoos.com preserves native assets and narrowly trusted Archive.org video URLs while private provider state stays absent.
 */
function text(value, max = 12000) {
	return String(value ?? '').trim().slice(0, max);
}

function count(value) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}

function knownDate(value) {
	if (!value) return '';
	const date = new Date(value);
	return Number.isNaN(date.valueOf()) ? '' : date.toISOString();
}

function stringList(value, max = 40) {
	return [...new Set((Array.isArray(value) ? value : [])
		.map(item => text(item, 1000))
		.filter(Boolean))].slice(0, max);
}

function optionalNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function publicAssets(value = []) {
	return (Array.isArray(value) ? value : []).map(asset => {
		const publicPath = text(asset?.publicPath || asset?.url, 2000);
		if (!isAllowedMigrationAssetPath(publicPath)) return null;
		return {
			id: text(asset.id || asset.assetId, 160),
			type: text(asset.type || asset.kind, 24),
			mime: text(asset.mime, 100),
			publicPath,
			alt: text(asset.alt || asset.title, 240),
			caption: text(asset.caption, 600),
			role: text(asset.role, 40),
			width: optionalNumber(asset.width),
			height: optionalNumber(asset.height),
			duration: optionalNumber(asset.duration),
			size: optionalNumber(asset.size)
		};
	}).filter(Boolean).slice(0, 20);
}

function normalizeItem(item = {}, importedAt = '') {
	return {
		provider: text(item.provider, 24).toLowerCase(),
		sourceId: text(item.sourceId, 240),
		sourceUrl: text(item.sourceUrl, 2000),
		sourceType: text(item.sourceType || item.type, 80),
		sourceProfile: item.sourceProfile || {},
		title: text(item.title, 800),
		content: text(item.content || item.caption, 60000),
		publishedAt: knownDate(item.publishedAt),
		rawPath: text(item.rawPath, 1600),
		mediaPaths: stringList(item.mediaPaths, 40),
		publicAssets: publicAssets(item.publicAssets),
		reactionCount: count(item.reactionCount),
		commentCount: count(item.commentCount),
		shareCount: count(item.shareCount),
		importedAt: knownDate(item.importedAt) || importedAt,
		contentKind: metaContentKind(item.sourceType || item.type)
	};
}

function normalizeManifest(value = {}) {
	const importedAt = new Date().toISOString();
	return {
		aliasId: text(value.aliasId, 120),
		heichelId: text(value.heichelId, 160),
		fallbackSeriesId: text(value.seriesId || value.fallbackSeriesId || 'root', 160) || 'root',
		items: (value.items || []).map(item => normalizeItem(item, importedAt))
	};
}

module.exports = {
	knownDate,
	publicAssets,
	normalizeItem,
	normalizeManifest
};
