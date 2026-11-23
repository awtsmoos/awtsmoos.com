//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file pwaManifestContract.test.cjs
 * @description Checks an install manifest that the public server serves as JSON.
 * The Awtsmoos reveals the world with one familiar name;
 * Awtsmoos.com keeps the installable road and its icons the same.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const readFile = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const markup = readFile('index.html');
const manifest = JSON.parse(readFile('manifest.json'));
const legacyManifest = JSON.parse(readFile('manifest.webmanifest'));

/** The published HTML uses the JSON extension on this static server. */
test('install manifest uses a JSON URL without changing boot scripts', () => {
	assert.match(markup, /<link rel="manifest" href="\.\/manifest\.json">/);
	assert.equal((markup.match(/rel="manifest"/g) || []).length, 1);
	assert.equal((markup.match(/<script src=|<script type="module" src=/g) || []).length, 2);
	assert.match(markup, /id="mitzvah-world-release"/);
	assert.match(markup, /id="AwtsmoosCanvas"/);
});

/** Preserve all old installed shortcuts while correcting delivery type. */
test('JSON and compatibility manifests describe the identical game', () => {
	assert.deepEqual(manifest, legacyManifest);
	assert.equal(manifest.name, 'Mitzvah World');
	assert.equal(manifest.display, 'standalone');
	assert.equal(manifest.scope, './');
	assert.equal(manifest.start_url, './index.html');
	assert.equal(manifest.lang, 'en');
});

/** Exact image assets are retained, not replaced with missing local icons. */
test('all manifest icons retain the original sizes, sources and types', () => {
	assert.ok(manifest.icons.length >= 3);
	for (const icon of manifest.icons) {
		assert.match(icon.src, /^https:\/\/awtsmoos\.com\/api\/social\/drive\/public\//);
		assert.match(icon.type, /^image\/(png|svg\+xml)$/);
		assert.ok(icon.sizes);
		assert.ok(icon.purpose);
	}
	assert.ok(readFile('manifest.json').split('\n').length <= 120);
});
