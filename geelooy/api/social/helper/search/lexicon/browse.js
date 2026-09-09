// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconBrowse
 * @description
 * The Awtsmoos reveals alphabet and sparse lexical ranges from tiny native testimony while page continuation lives in its own vessel;
 * Awtsmoos.com keeps this coordinator narrow so browsing never grows into a whole-dictionary memory or monolithic source file.
 */

const { closeCatalog, openCatalog } = require('./indexReader.js');
const { boundedLookup } = require('./normalize.js');
const { readShardAnchors } = require('./browseReader.js');
const { dictionaryBrowse } = require('./browsePage.js');
const {
	alphabetForSources,
	publicSources,
	selectedSourceIds
} = require('./browseCatalog.js');

/** Opens the tiny catalog for one operation and closes it regardless of success. */
async function withCatalog($i, operation) {
	const catalog = await openCatalog($i);
	if (!catalog.available) return { available: false, sources: [] };
	try {
		return await operation(catalog);
	} finally {
		await closeCatalog(catalog);
	}
}

/** Returns selected letter metadata or null when no chosen source owns that token. */
function selectedLetter(catalog, sourceIds, token) {
	return alphabetForSources(catalog, sourceIds).find(item => item.token === token) || null;
}

/** Lists native first-letter doorways and truthful merged counts without opening a lexical shard. */
async function dictionaryAlphabet($i, options = {}) {
	return withCatalog($i, catalog => {
		const sourceIds = selectedSourceIds(catalog, boundedLookup(options.sourceId, 64));
		return {
			available: true,
			sources: publicSources(catalog),
			letters: alphabetForSources(catalog, sourceIds)
		};
	});
}

/** Lists sparse lexical anchors for one selected first-letter shard across the chosen sources. */
async function dictionaryRanges($i, options = {}) {
	return withCatalog($i, async catalog => {
		const sourceIds = selectedSourceIds(catalog, boundedLookup(options.sourceId, 64));
		const token = boundedLookup(options.token || options.letter, 8).toLowerCase();
		const letter = selectedLetter(catalog, sourceIds, token);
		if (!letter) return { available: true, sources: publicSources(catalog), token, ranges: [] };
		const anchors = [];
		for (const sourceId of sourceIds) {
			for (const anchor of await readShardAnchors(catalog, sourceId, token, 64)) {
				anchors.push({ start: String(anchor.normalized || ''), label: String(anchor.headword || anchor.normalized || '') });
			}
		}
		const seen = new Set();
		const ranges = anchors
			.sort((left, right) => left.start.localeCompare(right.start, 'he'))
			.filter(anchor => anchor.start && !seen.has(anchor.start) && seen.add(anchor.start))
			.slice(0, 64);
		return { available: true, sources: publicSources(catalog), token, letter: letter.letter, ranges };
	});
}

module.exports = {
	dictionaryAlphabet,
	dictionaryBrowse,
	dictionaryRanges
};
