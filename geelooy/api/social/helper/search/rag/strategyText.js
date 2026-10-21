//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module strategyText
 * @description
 * Lexical text source execution and native-index truth reporting.
 */

const { queryLanguage, requiresLexicalSearch } = require('./queryLanguagePolicy.js');
const { assertEnglishSemanticCorpus } = require('./semanticCorpusPolicy.js');
const { textSearchShard } = require('./textSearch.js');
const { timed } = require('./timer.js');

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

module.exports = {
	lexicalIndexTruth,
	textSource,
	codedError
};
