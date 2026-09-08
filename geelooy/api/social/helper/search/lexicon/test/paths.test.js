//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file paths.test.js
 * @description
 * The Awtsmoos keeps discovery bounded to explicit root, live Dayuh, and canonical Work Dayuh with safe source/token vessels;
 * Awtsmoos.com proves no Documents-runtime guess or traversal-shaped source can quietly claim a lexicon throne.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	hasCatalog,
	lexiconCandidates,
	lexiconRoot,
	lexiconShardPath,
	selectCatalogRoot
} = require('../paths.js');

test('live Dayuh generation wins before repository fallback', t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-lexicon-paths-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const database = path.join(root, 'dayuhChadash');
	const repository = path.join(root, 'repository');
	const live = path.join(database, 'torah-sources', 'lexicons');
	fs.mkdirSync(path.join(live, 'current'), { recursive: true });
	fs.writeFileSync(path.join(live, 'current', 'catalog.awtsdb'), 'fixture');
	const candidates = lexiconCandidates({ db: { directory: database } }, repository);
	assert.equal(hasCatalog(live), true);
	assert.equal(selectCatalogRoot(candidates), live);
	assert.equal(candidates.some(candidate => candidate.includes('Documents')), false);
});

test('explicit root wins and shard paths reject traversal', () => {
	const previous = process.env.AWTSMOOS_LEXICON_ROOT;
	process.env.AWTSMOOS_LEXICON_ROOT = '/tmp/awtsmoos-explicit-lexicon';
	try {
		assert.equal(lexiconRoot({}), '/tmp/awtsmoos-explicit-lexicon');
		assert.throws(() => lexiconShardPath('/tmp/root', '../../etc', '05d1'), /unsafe_lexicon_shard/);
		assert.throws(() => lexiconShardPath('/tmp/root', 'bdb', '../x'), /unsafe_lexicon_shard/);
	} finally {
		if (previous == null) delete process.env.AWTSMOOS_LEXICON_ROOT;
		else process.env.AWTSMOOS_LEXICON_ROOT = previous;
	}
});
