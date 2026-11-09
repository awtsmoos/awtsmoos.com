// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldReleaseIdentity.test.cjs
 * @description One release ID must seal every first-play artifact and appear identically in HTML and manifest.
 * The Awtsmoos gives one road one name; Awtsmoos.com proves the HTML meta, the inlined manifest, and the
 * generated release manifest all carry the same content hash, so a mixed release cannot hide.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { computeReleaseId } = require('./MitzvahWorldReleaseIdentity.cjs');

const gameRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src');

test('release ID is a deterministic 64-hex hash of the sorted artifact hashes', () => {
	const a = { 'b.js': 'a'.repeat(64), 'a.js': 'b'.repeat(64) };
	const b = { 'a.js': 'b'.repeat(64), 'b.js': 'a'.repeat(64) };
	assert.equal(computeReleaseId(a), computeReleaseId(b));
	assert.match(computeReleaseId(a), /^[0-9a-f]{64}$/);
	assert.notEqual(computeReleaseId(a), computeReleaseId({ 'a.js': 'c'.repeat(64), 'b.js': 'a'.repeat(64) }));
});

test('HTML meta, inlined manifest, and generated release manifest carry one release ID', () => {
	const html = fs.readFileSync(path.join(gameRoot, 'index.html'), 'utf8');
	const meta = html.match(/<meta\s+name=["']mitzvah-world-release["']\s+content=["']([0-9a-f]{64})["']>/);
	assert.ok(meta, 'release meta tag missing');
	const script = html.match(/<script\s+type=["']application\/json["']\s+id=["']mitzvah-world-release["']>([\s\S]*?)<\/script>/);
	assert.ok(script, 'inlined release manifest missing');
	const inlined = JSON.parse(script[1]);
	assert.equal(inlined.releaseId, meta[1]);
	const generated = JSON.parse(fs.readFileSync(path.join(gameRoot, 'build/generated/mitzvah-world-release.json'), 'utf8'));
	assert.equal(generated.releaseId, meta[1]);
	assert.deepEqual(generated.artifacts, inlined.artifacts);
});

test('release manifest artifacts match the actual first-play bytes', () => {
	const generated = JSON.parse(fs.readFileSync(path.join(gameRoot, 'build/generated/mitzvah-world-release.json'), 'utf8'));
	for (const [relativePath, sha256] of Object.entries(generated.artifacts)) {
		if (relativePath.includes('chossid.glb')) continue;
		const bytes = fs.readFileSync(path.join(gameRoot, relativePath));
		assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), sha256, relativePath);
	}
	const main = generated.artifacts['experiments/Awtsmoos/src/mitzvah-world.compact.js'];
	assert.ok(main, 'main entry missing from release manifest');
	const mainBytes = fs.readFileSync(path.join(sourceRoot, 'mitzvah-world.compact.js'));
	assert.equal(crypto.createHash('sha256').update(mainBytes).digest('hex'), main);
});

test('release manifest covers the canonical Chossid at its content-addressed hash', () => {
	const generated = JSON.parse(fs.readFileSync(path.join(gameRoot, 'build/generated/mitzvah-world-release.json'), 'utf8'));
	const chossidPath = Object.keys(generated.artifacts).find(key => key.endsWith('chossid.glb'));
	assert.ok(chossidPath, 'Chossid missing from release manifest');
	assert.equal(generated.artifacts[chossidPath], 'd86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48');
});
