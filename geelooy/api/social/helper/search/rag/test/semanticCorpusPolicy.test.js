// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file semanticCorpusPolicy.test.js
 * @description
 * The Awtsmoos proves physical vectors do not equal semantic permission. English
 * publications may advertise the custom meaning-search lane; Hebrew Tanach keeps
 * lexical truth even while an obsolete flat-vector artifact remains on disk.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	assertEnglishSemanticCorpus,
	isEnglishSemanticCorpus
} = require('../semanticCorpusPolicy.js');
const { publicShard } = require('../resultShardShape.js');
const { semanticSnapshot } = require('../../routes/capabilities.js');

/** Models the historical Hebrew flat-vector publication that must stay non-semantic. */
function hebrewTanach() {
	return {
		id: 'tanach-hebrew-verses',
		title: 'Tanach Hebrew Verses',
		indexType: 'flat-f32',
		storedVectors: true,
		vectorEnabled: true,
		dimensions: 384
	};
}

test('semantic corpus policy accepts English and rejects Hebrew source generations', () => {
	assert.equal(isEnglishSemanticCorpus({
		id: 'likkutei-sichos',
		title: 'Likkutei Sichos English Comments'
	}), true);
	assert.equal(isEnglishSemanticCorpus(hebrewTanach()), false);
	assert.equal(isEnglishSemanticCorpus({
		title: 'Legacy neutral title',
		contentLanguage: 'en-US'
	}), true);
	assert.throws(
		() => assertEnglishSemanticCorpus(hebrewTanach()),
		error => error.code === 'SEMANTIC_CORPUS_LANGUAGE_MISMATCH'
	);
});

test('public shard modes never advertise Hebrew vectors as semantic search', () => {
	const hebrew = publicShard(hebrewTanach());
	const english = publicShard({
		id: 'meluket',
		title: 'Meluket English Translation Comments',
		listName: 'records',
		dimensions: 384,
		vectorEnabled: true
	});
	assert.equal(hebrew.semanticEligible, false);
	assert.equal(hebrew.modes.some(mode => mode.includes('semantic')), false);
	assert.equal(english.semanticEligible, true);
	assert.equal(english.modes.includes('semantic-vector-indexed'), true);
});

test('capability summary counts only English semantic publications', () => {
	const english = publicShard({
		id: 'sefer-hasichos',
		title: 'Sefer HaSichos English Comments',
		listName: 'records',
		dimensions: 384,
		vectorEnabled: true
	});
	const semantic = semanticSnapshot([publicShard(hebrewTanach()), english]);
	assert.equal(semantic.indexedCount, 1);
	assert.equal(semantic.storedVectorCount, 1);
	assert.equal(semantic.indexedLanes[0].id, english.id);
});

test('English query cannot awaken embeddings against a Hebrew source shard', async () => {
	const { findSource } = require('../strategy.js');
	const embedderPath = require.resolve('../queryEmbedder.js');
	delete require.cache[embedderPath];
	await assert.rejects(
		findSource({
			shard: hebrewTanach(),
			query: 'creation of light',
			strategy: 'vector',
			timings: {}
		}),
		error => error.code === 'SEMANTIC_CORPUS_LANGUAGE_MISMATCH'
	);
	assert.equal(require.cache[embedderPath], undefined);
});
