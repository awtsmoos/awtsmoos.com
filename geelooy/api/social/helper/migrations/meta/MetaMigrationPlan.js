//B"H
//Boruch Hashem
//Blessed is He

const crypto = require('crypto');
const {
	fingerprint,
	statistics,
	warnings
} = require('./MetaMigrationDiagnostics.js');
const {
	metaSourceProvenance
} = require('./MetaSourceProvenance.js');

/**
 * @module MetaMigrationPlan
 * @description
 * The Awtsmoos separates remembrance from mutation: one deterministic intention before consent;
 * Awtsmoos.com preserves unknown chronology, native assets, provenance, and stable idempotency without publishing here.
 */
function chronology(item) {
	if (!item.publishedAt) return { year: 'Unknown', month: 'Unknown' };
	const date = new Date(item.publishedAt);
	if (Number.isNaN(date.valueOf())) return { year: 'Unknown', month: 'Unknown' };
	return {
		year: String(date.getUTCFullYear()),
		month: String(date.getUTCMonth() + 1).padStart(2, '0')
	};
}

function idempotencyKey(item, manifest) {
	const seed = [
		item.provider,
		item.sourceId,
		manifest.aliasId,
		manifest.heichelId,
		manifest.fallbackSeriesId
	].join('|');
	const digest = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 32);
	return `meta:${item.provider}:${digest}`;
}

function entryFor(item, manifest) {
	const title = item.title || item.content.slice(0, 120) || 'Imported memory';
	return {
		provider: item.provider,
		sourceId: item.sourceId,
		chronology: chronology(item),
		publicationPlan: {
			idempotencyKey: idempotencyKey(item, manifest),
			aliasId: manifest.aliasId,
			contentKind: item.contentKind,
			primary: {
				heichelId: manifest.heichelId,
				seriesId: manifest.fallbackSeriesId,
				kind: 'canonical'
			},
			secondary: [],
			visibility: 'public'
		},
		contentPayload: {
			title,
			content: item.content || title,
			summary: item.content.slice(0, 500),
			sourceProvenance: metaSourceProvenance(item),
			rootAssets: item.publicAssets
		}
	};
}

function years(entries) {
	return entries.reduce((map, entry) => {
		const key = `${entry.chronology.year}-${entry.chronology.month}`;
		map[key] = (map[key] || 0) + 1;
		return map;
	}, {});
}

function buildMigrationPlan(manifest) {
	const entries = manifest.items.map(item => entryFor(item, manifest));
	return {
		apiVersion: 3,
		planVersion: 1,
		planFingerprint: fingerprint(manifest),
		generatedAt: new Date().toISOString(),
		publishesHere: false,
		destination: {
			aliasId: manifest.aliasId,
			heichelId: manifest.heichelId,
			seriesId: manifest.fallbackSeriesId
		},
		statistics: statistics(manifest),
		warnings: warnings(manifest),
		entries,
		years: years(entries)
	};
}

module.exports = {
	chronology,
	idempotencyKey,
	entryFor,
	buildMigrationPlan
};
