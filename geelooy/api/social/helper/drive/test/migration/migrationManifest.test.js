//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins unordered sparks into one stable testimony;
 * Awtsmoos.com proves fingerprints and cache intent never depend on guesswork.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {
	buildMigrationManifest,
	createMigrationManifest
} = require('../../migration/migrationManifest.js');
const {
	classifyMigrationItem,
	isContentAddressedSourcePath
} = require('../../migration/migrationItemPolicy.js');
const {
	createMigrationTestWorld,
	writeSourceFile
} = require('./testHelpers.js');

function item(sourceRelativePath, content, overrides = {}) {
	const buffer = Buffer.from(content);
	return {
		sourceRelativePath,
		size: buffer.length,
		sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
		mime: 'text/plain; charset=utf-8',
		visibility: 'public',
		cachePolicy: 'mutable',
		...overrides
	};
}

test('creates stable fingerprints independent of item order and generated time', () => {
	const items = [item('various/b.txt', 'b'), item('Way/a.txt', 'a')];
	const first = buildMigrationManifest(items, {
		generatedAt: '2026-01-01T00:00:00.000Z'
	});
	const second = buildMigrationManifest(items.reverse(), {
		generatedAt: '2027-01-01T00:00:00.000Z'
	});
	assert.equal(first.fingerprint, second.fingerprint);
	assert.deepEqual(first.items.map(value => value.sourceRelativePath), [
		'Way/a.txt',
		'various/b.txt'
	]);
});

test('keeps logical assets mutable and content-addressed names immutable', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	const hash = 'a'.repeat(64);
	await writeSourceFile(world.sourceRoot, 'index.html', '<h1>B\"H</h1>');
	await writeSourceFile(world.sourceRoot, 'assets/model.glb', 'model');
	await writeSourceFile(world.sourceRoot, `assets/app.${hash}.js`, 'code');
	const manifest = await createMigrationManifest(world.sourceRoot, {
		generatedAt: '2026-07-26T00:00:00.000Z'
	});
	assert.equal(manifest.totals.fileCount, 3);
	assert.equal(policyFor(manifest, 'index.html'), 'mutable');
	assert.equal(policyFor(manifest, 'assets/model.glb'), 'mutable');
	assert.equal(policyFor(manifest, `assets/app.${hash}.js`), 'immutable');
	assert.equal(JSON.stringify(manifest).includes(world.sourceRoot), false);
});

test('requires explicit or visible content-address evidence for immutable caching', () => {
	assert.equal(isContentAddressedSourcePath('assets/app.deadbeef.js'), false);
	assert.equal(isContentAddressedSourcePath(`objects/${'b'.repeat(64)}`), true);
	assert.equal(classifyMigrationItem('assets/site.css').cachePolicy, 'mutable');
	assert.equal(classifyMigrationItem('assets/site.css', {
		cachePolicy: 'immutable'
	}).cachePolicy, 'immutable');
	assert.equal(classifyMigrationItem(`assets/${'c'.repeat(32)}.png`, {
		visibility: 'private'
	}).cachePolicy, 'mutable');
});

test('rejects absolute source paths and malformed hashes', () => {
	assert.throws(() => buildMigrationManifest([item('/escape.txt', 'x')]), {
		code: 'SOURCE_PATH_ABSOLUTE'
	});
	assert.throws(() => buildMigrationManifest([
		{ ...item('ok.txt', 'x'), sha256: 'bad' }
	]), { code: 'MANIFEST_HASH_INVALID' });
});

function policyFor(manifest, destinationPath) {
	return manifest.items.find(itemValue => {
		return itemValue.destinationPath === destinationPath;
	}).cachePolicy;
}
