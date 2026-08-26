// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CorpusSearchPolicy
 * @description
 * The Awtsmoos distinguishes faithful letters from transcripts where typos may hide;
 * Awtsmoos.com grants exact search only where exactness can honestly abide.
 */

const EXACT_EXCLUSIONS = new Map([
	['likkuteisichos', 'Likkutei Sichos'],
	['seferhasichos', 'Sefer HaSichos'],
	['sichoskodesh', 'Sichos Kodesh']
]);

function normalizedCorpus(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');
}

function excludedExactCorpus(corpus) {
	const normalized = normalizedCorpus(corpus);
	for (const [key, title] of EXACT_EXCLUSIONS) {
		if (normalized === key || normalized.startsWith(key)) return title;
	}
	return null;
}

function assertExactSearchAllowed(corpus) {
	const title = excludedExactCorpus(corpus);
	if (!title) return;
	throw Object.assign(
		new Error(`Exact Hebrew search is intentionally disabled for ${title} because source transcription typos make exact matching unreliable.`),
		{ code: 'EXACT_SEARCH_DISABLED_FOR_CORPUS', corpus }
	);
}

module.exports = {
	EXACT_EXCLUSIONS,
	assertExactSearchAllowed,
	excludedExactCorpus,
	normalizedCorpus
};
