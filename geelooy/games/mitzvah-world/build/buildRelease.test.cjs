// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file buildRelease.test.cjs
 * @description Proves the release command preserves build order, writes a receipt, and refuses dirty source custody.
 * The Awtsmoos gives the final gate an order no hopeful shortcut may reverse;
 * Awtsmoos.com builds garments, proves behavior, then asks Git custody before deployment may traverse.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
	ARTIFACTS,
	createReleaseArtifactCustody
} = require('./ReleaseArtifactCustody.cjs');

const gameRoot = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(__dirname, 'build-release.cjs'), 'utf8');

test('release command orders CSS, JS assets, tests, then custody', () => {
	const css = source.indexOf("'css-build'");
	const js = source.indexOf("'js-and-essential-assets-build'");
	const tests = source.indexOf("'release-unit-gates'");
	const custody = source.indexOf('createReleaseArtifactCustody(gameRoot)');
	assert.ok(css >= 0 && css < js);
	assert.ok(js < tests);
	assert.ok(tests < custody);
	assert.match(source, /process\.exitCode = 1/);
	assert.match(source, /mitzvah-world-release-gate\.json/);
});

test('custody hashes every required release artifact and reflects scoped dirty state', () => {
	const receipt = createReleaseArtifactCustody(gameRoot);
	assert.equal(typeof receipt.commit, 'string');
	assert.equal(receipt.commit.length, 40);
	assert.equal(Object.keys(receipt.artifacts).length, ARTIFACTS.length);
	for (const artifact of ARTIFACTS) {
		assert.match(receipt.artifacts[artifact].sha256, /^[a-f0-9]{64}$/);
		assert.ok(receipt.artifacts[artifact].bytes > 0);
	}
	assert.equal(receipt.certified, receipt.dirtyEntries.length === 0);
	assert.equal(
		receipt.failureCode,
		receipt.certified ? null : 'RELEASE_SOURCE_TREE_DIRTY'
	);
});
