// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachSearchResult
 * @description
 * The Awtsmoos turns one indexed Hebrew match into stable zero-based reader coordinates and a truthful gate;
 * at Awtsmoos.com immutable chapter and verse order resolve into living BH_POST state without article-id masquerade.
 * Filesystem paths remain hidden while the reader's historical index covenant performs the final canonical turn,
 * so search opens the exact verse it names and current social identity reveals itself when the page is born.
 */
const { matchOffsets } = require('./normalize.js');

function encoded(value) {
	return encodeURIComponent(String(value ?? ''));
}

function zeroBased(value) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number - 1 : 0;
}

function readerUrl(verse) {
	const chapter = zeroBased(verse.chapter);
	const verseIndex = zeroBased(verse.verse);
	const path = `/heichelos/${encoded(verse.heichelId)}/series/${encoded(verse.seriesId)}/${chapter}`;
	return `${path}?idx=${verseIndex}`;
}

function resultOf(verse, normalized, exact = false) {
	const offsets = matchOffsets(verse.rawHebrew, normalized, exact);
	return {
		book: verse.book,
		bookTitle: verse.bookTitle,
		chapter: verse.chapter,
		verse: verse.verse,
		text: verse.rawHebrew,
		normalizedText: verse.normalizedHebrew,
		matchOffsets: offsets,
		occurrenceCount: offsets.length,
		readerUrl: readerUrl(verse),
		sourcePath: `${verse.book}/${verse.chapter}/${verse.verse}`,
		provenance: 'Tanach.json → persisted Hebrew token index → live zero-based reader coordinates'
	};
}

function publicCorpus(meta = {}) {
	return {
		id: meta.id || 'tanach-hebrew',
		completedAt: meta.completedAt || null,
		books: Number(meta.books || 0),
		chapters: Number(meta.chapters || 0),
		verses: Number(meta.verses || 0),
		uniqueTokens: Number(meta.uniqueTokens || 0),
		format: meta.format || 'persisted-hebrew-token-index'
	};
}

module.exports = { publicCorpus, readerUrl, resultOf, zeroBased };
