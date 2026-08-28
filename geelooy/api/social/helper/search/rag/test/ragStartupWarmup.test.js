// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ragStartupWarmup.test.js
 * @description
 * The Awtsmoos warms the database root already revealed by a living request and proves immutable RAG publication without demanding a historical comment shadow;
 * Awtsmoos.com may stand ready with manifest, vectors, and metadata alone, while `socialPacked` remains a separate hydration chamber whose absence cannot darken library search.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
	REPOSITORY_ROOT,
	configuredRoot,
	resetRagStartupWarmup,
	rootFromInterface,
	warmRagCorpus
} = require('../ragStartupWarmup.js');

/** Creates the smallest valid immutable RAG publication without any socialPacked database. */
function publicationFixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-rag-warmup-'));
	const rag = path.join(root, 'ai', 'comment-rag');
	fs.mkdirSync(rag, { recursive: true });
	const base = path.join(rag, 'meluket-english-comments-rag');
	fs.writeFileSync(`${base}.awtsdb`, 'B"H immutable test database');
	fs.writeFileSync(`${base}.meta.jsonl`, '{"id":"seed"}\n');
	fs.writeFileSync(`${base}.f32`, Buffer.alloc(2 * 384 * 4));
	fs.writeFileSync(`${base}.fast-manifest.json`, JSON.stringify({
		BH: 'B"H',
		id: 'meluket',
		records: 2,
		listLength: 2,
		dimensions: 384,
		vectorEnabled: true
	}, null, '\t'));
	return root;
}

test('resolves configured dbPath from the repository root', () => {
	assert.equal(
		configuredRoot({}),
		path.resolve(REPOSITORY_ROOT, '../../dayuhChadash')
	);
});

test('prefers explicit production and isolated roots for manual warmup', () => {
	assert.equal(configuredRoot({ AWTS_DB_ROOT: '/tmp/production-root' }), '/tmp/production-root');
	assert.equal(configuredRoot({ AWTS_ISOLATED_DB_ROOT: '/tmp/isolated-root' }), '/tmp/isolated-root');
	assert.equal(
		configuredRoot({
			AWTS_DB_ROOT: '/tmp/production-root',
			AWTS_ISOLATED_DB_ROOT: '/tmp/isolated-root'
		}),
		'/tmp/production-root'
	);
});

test('request database directory outranks environment and tracked configuration', () => {
	assert.equal(
		rootFromInterface(
			{ db: { directory: '/tmp/request-root' } },
			{ AWTS_DB_ROOT: '/tmp/environment-root' }
		),
		'/tmp/request-root'
	);
});

test('warms immutable RAG publication without a socialPacked comment database', () => {
	const root = publicationFixture();
	const previous = process.env.AWTS_RAG_SEMANTIC_WARMUP;
	process.env.AWTS_RAG_SEMANTIC_WARMUP = '0';
	resetRagStartupWarmup();
	try {
		assert.equal(fs.existsSync(path.join(root, 'socialPacked')), false);
		const result = warmRagCorpus({ db: { directory: root } });
		assert.equal(result.ok, true);
		assert.equal(result.root, root);
		assert.equal(result.seedId, 'meluket');
		assert.equal(result.records, 2);
		assert.equal(result.dimensions, 384);
	} finally {
		resetRagStartupWarmup();
		fs.rmSync(root, { recursive: true, force: true });
		if (previous === undefined) {
			delete process.env.AWTS_RAG_SEMANTIC_WARMUP;
		} else {
			process.env.AWTS_RAG_SEMANTIC_WARMUP = previous;
		}
	}
});
