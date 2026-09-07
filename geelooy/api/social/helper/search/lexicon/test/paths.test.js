// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file paths.test.js
 * @description
 * The Awtsmoos lets a completed lexicon treasury be found even when an earlier runtime AI chamber also exists;
 * Awtsmoos.com proves bounded candidate order, verified catalog selection, and explicit operator override without scanning the world.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	lexiconCandidates,
	lexiconRoot,
	selectCatalogRoot
} = require('../paths.js');

test('canonical workstation lexicon can win after earlier empty runtime candidates', t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-lexicon-paths-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const $i = { db: { directory: path.join(root, 'database') } };
	const candidates = lexiconCandidates($i, root);
	const canonical = path.join(
		root,
		'Documents',
		'dayuhChadash-runtime',
		'torah-sources',
		'lexicons'
	);
	fs.mkdirSync(canonical, { recursive: true });
	fs.writeFileSync(path.join(canonical, 'manifest.json'), '{}');
	fs.writeFileSync(path.join(canonical, 'index.json'), '{}');
	assert.ok(candidates.includes(canonical));
	assert.equal(selectCatalogRoot(candidates), canonical);
});

test('explicit lexicon root remains the highest operator authority', () => {
	const previous = process.env.AWTSMOOS_LEXICON_ROOT;
	process.env.AWTSMOOS_LEXICON_ROOT = '/tmp/awtsmoos-explicit-lexicon';
	try {
		assert.equal(lexiconRoot({}), '/tmp/awtsmoos-explicit-lexicon');
	} finally {
		if (previous == null) delete process.env.AWTSMOOS_LEXICON_ROOT;
		else process.env.AWTSMOOS_LEXICON_ROOT = previous;
	}
});
