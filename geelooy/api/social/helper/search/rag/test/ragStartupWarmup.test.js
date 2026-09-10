//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ragStartupWarmup.test.js
 * @description
 * The Awtsmoos proves startup from one genuine native publication seal while
 * social comments and JSON-era sidecars are absent. Awtsmoos.com keeps request
 * roots authoritative and semantic-model warmup independently optional.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createNativePublicationFixture } = require('./nativePublicationCatalogFixture.js');
const {
	REPOSITORY_ROOT,
	configuredRoot,
	resetRagStartupWarmup,
	rootFromInterface,
	warmRagCorpus
} = require('../ragStartupWarmup.js');

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


test('warms native publication truth without JSON sidecars or socialPacked', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-rag-warmup-'));
	const previous = process.env.AWTS_RAG_SEMANTIC_WARMUP;
	process.env.AWTS_RAG_SEMANTIC_WARMUP = '0';
	resetRagStartupWarmup();
	try {
		await createNativePublicationFixture(root);
		assert.equal(fs.existsSync(path.join(root, 'socialPacked')), false);
		assert.equal(findLegacySidecars(root).length, 0);
		const result = warmRagCorpus({ db: { directory: root } });
		assert.equal(result.ok, true);
		assert.equal(result.root, root);
		assert.equal(result.generation, 'fixture-generation');
		assert.equal(result.seedId, 'meluket');
		assert.equal(result.records, 2);
		assert.equal(result.dimensions, 384);
		assert.equal(result.publicationCount, 1);
	} finally {
		resetRagStartupWarmup();
		fs.rmSync(root, { recursive: true, force: true });
		if (previous === undefined) delete process.env.AWTS_RAG_SEMANTIC_WARMUP;
		else process.env.AWTS_RAG_SEMANTIC_WARMUP = previous;
	}
});

/** Returns forbidden JSON-era runtime authority files beneath one fixture. */
function findLegacySidecars(root) {
	const rag = path.join(root, 'ai', 'comment-rag');
	return fs.readdirSync(rag).filter(name => /\.(json|jsonl|f32)$/.test(name));
}
