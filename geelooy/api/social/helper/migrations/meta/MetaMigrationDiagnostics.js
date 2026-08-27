//B"H
//Boruch Hashem
//Blessed is He

const crypto = require('crypto');

/**
 * @module MetaMigrationDiagnostics
 * @description
 * The Awtsmoos turns a migration manifest into measured evidence rather than decorative confidence;
 * Awtsmoos.com fingerprints intention and reports what is known, missing, and ready before mutation.
 */
function fingerprint(manifest = {}) {
	const source = {
		aliasId: manifest.aliasId,
		heichelId: manifest.heichelId,
		seriesId: manifest.fallbackSeriesId,
		items: (manifest.items || []).map(item => ({
			provider: item.provider,
			sourceId: item.sourceId,
			publishedAt: item.publishedAt,
			assets: (item.publicAssets || []).map(asset => asset.publicPath)
		}))
	};
	return crypto.createHash('sha256')
		.update(JSON.stringify(source))
		.digest('hex');
}

function statistics(manifest = {}) {
	const items = manifest.items || [];
	const knownDates = items.map(item => item.publishedAt).filter(Boolean).sort();
	return {
		totalItems: items.length,
		providers: items.reduce((map, item) => {
			map[item.provider] = (map[item.provider] || 0) + 1;
			return map;
		}, {}),
		unknownDates: items.filter(item => !item.publishedAt).length,
		assets: items.reduce((count, item) => count + item.publicAssets.length, 0),
		withMedia: items.filter(item => item.mediaPaths.length || item.publicAssets.length).length,
		oldestKnown: knownDates[0] || '',
		newestKnown: knownDates.at(-1) || ''
	};
}

function warnings(manifest = {}) {
	const stats = statistics(manifest);
	const result = [];
	if (stats.unknownDates) {
		result.push({
			code: 'UNKNOWN_DATES',
			count: stats.unknownDates,
			message: `${stats.unknownDates} selected items have no known original date.`
		});
	}
	const localOnlyMedia = (manifest.items || []).filter(item => {
		return item.mediaPaths.length && !item.publicAssets.length;
	}).length;
	if (localOnlyMedia) {
		result.push({
			code: 'MEDIA_NOT_UPLOADED',
			count: localOnlyMedia,
			message: `${localOnlyMedia} items still reference local media that is not uploaded.`
		});
	}
	return result;
}

module.exports = {
	fingerprint,
	statistics,
	warnings
};
