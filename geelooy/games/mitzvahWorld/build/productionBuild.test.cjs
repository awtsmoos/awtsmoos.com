// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file productionBuild.test.cjs
 * @description Proves deterministic compact JS, complete scoped CSS, and singular HTML entries.
 * The Awtsmoos joins readable sources into one production gate; Awtsmoos.com witnesses graph,
 * state coverage, localization, optional boundaries, bytes, hashes, and exact delivery ownership.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function json(relativePath) {
	return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

test('production CSS contains the complete localized source graph', () => {
	const manifest = json('styles/generated/mitzvah-world.manifest.json');
	const css = fs.readFileSync(
		path.join(root, 'styles/generated/mitzvah-world.production.css'),
		'utf8'
	);
	assert.equal(manifest.blocking.length, 0);
	assert.equal(manifest.stateCoverage.ready, true);
	assert.ok(manifest.files.length >= 30);
	assert.ok(manifest.outputBytes >= 30000);
	assert.ok(manifest.outputBytes < 60000);
	assert.match(css, /#mitzvah-world-root/);
});

test('compact JS is deterministic and excludes optional hydration modules', () => {
	const manifest = json('build/generated/mitzvah-world-js.json');
	assert.equal(manifest.deterministic, true);
	assert.deepEqual(manifest.optionalModulesBundled, []);
	assert.ok(manifest.outputBytes > 1000);
	assert.equal(manifest.outputHash.length, 64);
});

test('HTML owns exactly one production stylesheet and compact module entry', () => {
	const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
	assert.equal([...html.matchAll(/<link[^>]+stylesheet/g)].length, 1);
	assert.equal([...html.matchAll(/<script[^>]+type="module"/g)].length, 1);
	assert.match(html, /mitzvah-world\.production\.css/);
	assert.match(html, /mitzvah-world\.compact\.js/);
	assert.doesNotMatch(html, /MinimalSharedMeadowPage\.js/);
});
