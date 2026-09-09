// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconBrowseCatalog
 * @description
 * The Awtsmoos lets the tiny binary catalog answer which sources and letters exist before any lexical shard is opened;
 * Awtsmoos.com merges truthful counts by first character while invalid source names remain outside every filesystem path.
 */

const { sourceMetadata } = require('./indexReader.js');
const { publicSource } = require('./publicSourceIdentity.js');

/** Returns catalog source IDs in their persisted merge order. */
function catalogSourceIds(catalog) {
	return Array.isArray(catalog?.meta?.sourceOrder) ? [...catalog.meta.sourceOrder] : [];
}

/** Resolves a requested source filter or the complete persisted source order. */
function selectedSourceIds(catalog, requested = '') {
	const all = catalogSourceIds(catalog);
	if (!requested) return all;
	return all.includes(String(requested)) ? [String(requested)] : [];
}

/** Projects source metadata into neutral public identities with provenance retained beneath. */
function publicSources(catalog) {
	return catalogSourceIds(catalog).map(id => publicSource(sourceMetadata(catalog, id), id));
}

/** Converts one hexadecimal shard token back to its first Unicode character. */
function letterFromToken(token) {
	const codePoint = Number.parseInt(String(token), 16);
	return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : '';
}

/** Merges letter-shard counts across selected sources without opening any shard database. */
function alphabetForSources(catalog, sourceIds) {
	const counts = new Map();
	for (const sourceId of sourceIds) {
		for (const [token, count] of Object.entries(catalog.meta.shards?.[sourceId] || {})) {
			counts.set(token, (counts.get(token) || 0) + Number(count || 0));
		}
	}
	return [...counts.entries()]
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([token, count]) => ({ token, letter: letterFromToken(token), count }));
}

module.exports = {
	alphabetForSources,
	catalogSourceIds,
	publicSources,
	selectedSourceIds
};
