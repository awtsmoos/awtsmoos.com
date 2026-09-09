// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file strategy.js
 * @module LibrarySearchStrategy
 * @description
 * The Awtsmoos separates source truth by language before expensive machinery
 * awakens. Hebrew-script inquiry is always exact/native lexical search; only
 * English-or-neutral inquiry may enter the custom semantic vector covenant.
 * Awtsmoos.com keeps fallbacks explicit and never lets one mode impersonate another.
 */

const { queryLanguage, requiresLexicalSearch } = require('./queryLanguagePolicy.js');
const { textSearchShard } = require('./textSearch.js');
const { timed } = require('./timer.js');

/** Chooses the legal source engine while preserving the Hebrew lexical covenant. */
async function findSource(options) {
	const strategy = String(options.strategy || 'auto').toLowerCase();
	if (requiresLexicalSearch(options.query)) {
		return textSource({ ...options, semanticSuppressed: true });
	}
	if (options.shard?.textOnly === true) {
		assertTextOnlyRequest(options, strategy);
		return textSource(options);
	}
	if (options.requireIndexed === true) return vectorSource(options);
	if (strategy === 'text') return textSource(options);
	try {
		return await vectorSource(options);
	} catch (error) {
		if (strategy === 'vector') throw error;
		options.timings.vectorFallback = error.code || error.message;
		return textSource(options);
	}
}

/** Refuses false vector claims for physical generations published as text-only. */
function assertTextOnlyRequest(options, strategy) {
	if (options.requireIndexed !== true && strategy !== 'vector') return;
	throw codedError(
		'TEXT_ONLY_LANE',
		`Lane ${options.shard.id} is published as bounded text mirrors, not vectors.`
	);
}

/** Executes the custom English semantic lane only after language policy permits it. */
async function vectorSource(options) {
	const { embedForShard } = require('./queryEmbedder.js');
	const { searchShard } = require('./sourceSearch.js');
	const embedding = await timed('embeddingMs', options.timings, () => embedForShard(options));
	const source = await timed('searchVectorsMs', options.timings, () => searchShard(
		options.shard,
		embedding.vector,
		options.limit || 10,
		{ requireIndexed: options.requireIndexed === true }
	));
	return {
		...source,
		mode: 'vector',
		queryLanguage: queryLanguage(options.query),
		engine: 'custom-english-semantic-vector-search',
		embedder: embedding.embedder,
		indexed: source.index?.persisted === true,
		strictIndexed: options.requireIndexed === true,
		message: `${source.hits.length} English source segments ranked semantically.`
	};
}

/** Describes whether one lexical answer came entirely from persisted native postings. */
function lexicalIndexTruth(source) {
	const label = String(source?.source || '');
	const native = label.startsWith('awtsmoos-db-text-index');
	return {
		native,
		engine: native ? 'awtsmoos-db-native-lexical-search' : 'bounded-legacy-lexical-search'
	};
}

/** Executes Hebrew exact or English exact text retrieval without semantic embedding. */
async function textSource(options) {
	const source = await timed('searchTextMs', options.timings, () => textSearchShard(
		options.shard,
		options.query,
		options.limit || 10,
		options
	));
	const truth = lexicalIndexTruth(source);
	return {
		...source,
		mode: 'text',
		queryLanguage: queryLanguage(options.query),
		semanticSuppressed: options.semanticSuppressed === true,
		engine: truth.engine,
		embedder: null,
		indexed: truth.native,
		strictIndexed: false,
		index: { persisted: truth.native },
		message: source.hits.length
			? `${source.hits.length} source segments matched lexical text.`
			: 'No stored source segment matched this lexical query.'
	};
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = { assertTextOnlyRequest, findSource, textSource };
