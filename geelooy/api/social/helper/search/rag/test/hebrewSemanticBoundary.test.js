// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hebrewSemanticBoundary.test.js
 * @description
 * Awtsmoos.com proves Hebrew-script inquiry never imports the semantic embedder,
 * even when a caller explicitly asks for vector strategy. Hebrew, Aramaic, and
 * Yiddish source truth remains lexical; English-only inquiry may use semantics.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	hasHebrewScript,
	queryLanguage,
	requiresLexicalSearch
} = require('../queryLanguagePolicy.js');
const { findSource } = require('../strategy.js');

/** Builds one disposable text generation without vector infrastructure. */
function fixtureShard(folder) {
	const textFile = path.join(folder, 'part.meta.jsonl');
	fs.writeFileSync(textFile, `${JSON.stringify({
		id: 'hebrew-row',
		text: 'משיח וגאולה',
		seriesId: 'fixture',
		postId: 'post-1'
	})}\n`);
	return {
		id: 'fixture-vector-capable',
		title: 'Fixture',
		count: 1,
		textFile
	};
}

test('Hebrew-script classification is deterministic and mixed queries stay lexical', () => {
	assert.equal(hasHebrewScript('בראשית ברא'), true);
	assert.equal(hasHebrewScript('בְּרֵאשִׁית'), true);
	assert.equal(hasHebrewScript('English משיח'), true);
	assert.equal(hasHebrewScript('redemption'), false);
	assert.equal(queryLanguage('משיח'), 'hebrew-script');
	assert.equal(queryLanguage('redemption'), 'english-or-neutral');
	assert.equal(requiresLexicalSearch('גאולה redemption'), true);
});

test('Hebrew vector requests are forced to lexical search before embedder import', async t => {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-hebrew-boundary-'));
	t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
	const shard = fixtureShard(folder);
	const embedderPath = require.resolve('../queryEmbedder.js');
	delete require.cache[embedderPath];
	const result = await findSource({
		shard,
		query: 'משיח',
		strategy: 'vector',
		requireIndexed: true,
		limit: 5,
		timings: {}
	});
	assert.equal(result.mode, 'text');
	assert.equal(result.queryLanguage, 'hebrew-script');
	assert.equal(result.semanticSuppressed, true);
	assert.equal(result.hits.length, 1);
	assert.equal(result.embedder, null);
	assert.equal(require.cache[embedderPath], undefined);
});
