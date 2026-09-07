// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactTanachNavigation
 * @description
 * The Awtsmoos lets an exact Hebrew phrase reveal its living Tanach coordinate before distant corpus echoes contend;
 * Awtsmoos.com reads the persisted 39-book index only, preserving real verse text, provenance, and reader ascent.
 */

const { execute } = require('../tanach/search.js');

function eligibleExactQuery(query = '') {
	const text = String(query || '').trim();
	const tokens = text.split(/\s+/).filter(Boolean);
	return tokens.length >= 2 && /[\u0590-\u05ff]/.test(text);
}

/** Returns canonical verse navigation only when a multi-word Hebrew phrase exactly exists in Tanach. */
function exactTanachHits({ query = '', limit = 3 } = {}) {
	if (!eligibleExactQuery(query)) return [];
	try {
		const result = execute({
			query,
			exact: true,
			limit: Math.min(3, Math.max(1, Number(limit) || 3)),
			offset: 0
		});
		return (result.results || []).map((verse, index) => verseHit(verse, index + 1));
	} catch {
		return [];
	}
}

function verseHit(verse, rank) {
	return {
		id: `tanach-verse:${verse.book}:${verse.chapter}:${verse.verse}`,
		rank,
		score: 1000,
		source: 'canonical-tanach-exact',
		row: {
			type: 'tanach-verse',
			title: `${verse.bookTitle} ${verse.chapter}:${verse.verse}`,
			text: verse.text,
			bookId: verse.book,
			bookTitle: verse.bookTitle,
			chapter: verse.chapter,
			verse: verse.verse,
			readerUrl: verse.readerUrl,
			sourceHref: verse.readerUrl,
			sourceLabel: 'Tanach',
			libraryLaneId: 'tanach-hebrew-verses',
			libraryLaneTitle: 'Tanach Hebrew Verses',
			canonicalNavigation: true,
			exactText: true,
			provenance: verse.provenance
		}
	};
}

module.exports = {
	eligibleExactQuery,
	exactTanachHits,
	verseHit
};
