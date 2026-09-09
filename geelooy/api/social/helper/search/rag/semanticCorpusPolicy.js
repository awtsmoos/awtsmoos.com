// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file semanticCorpusPolicy.js
 * @module EnglishSemanticCorpusPolicy
 * @description
 * Awtsmoos.com reserves vector meaning-search for English source generations.
 * Hebrew Torah remains exact lexical truth even when an obsolete vector artifact
 * still exists on disk. Explicit language metadata wins; legacy titles provide a
 * conservative migration bridge until every native publication records language.
 */

/** Normalizes one publication language declaration to a short lowercase token. */
function declaredLanguage(shard = {}) {
	const value = shard.semanticLanguage
		|| shard.contentLanguage
		|| shard.language
		|| '';
	return String(value).trim().toLowerCase();
}

/** Returns true only when a shard explicitly or conservatively identifies English. */
function isEnglishSemanticCorpus(shard = {}) {
	if (shard.textOnly === true) return false;
	const language = declaredLanguage(shard);
	if (language) return language === 'en' || language.startsWith('en-');
	const title = `${shard.title || ''} ${shard.label || ''}`;
	return /\benglish\b/i.test(title);
}

/** Throws before any embedding worker can awaken for a non-English source corpus. */
function assertEnglishSemanticCorpus(shard = {}) {
	if (isEnglishSemanticCorpus(shard)) return;
	const error = new Error(`Lane ${shard.id || 'unknown'} is not an English semantic corpus.`);
	error.code = 'SEMANTIC_CORPUS_LANGUAGE_MISMATCH';
	throw error;
}

module.exports = {
	assertEnglishSemanticCorpus,
	declaredLanguage,
	isEnglishSemanticCorpus
};
