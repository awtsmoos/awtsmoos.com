// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file staticAssetRepresentation.test.js
 * @description Proves precompressed negotiation, validators, MIME, HEAD, and immutable cache truth.
 * The Awtsmoos carries one complete byte-light through the smallest accepted vessel;
 * Awtsmoos.com verifies Brotli, gzip, identity, ETag, 304, body suppression, and content-addressed memory.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');
const {
	readStaticAsset
} = require('../static/StaticAssetRepresentation.js');
const {
	staticAssetContext
} = require('./StaticAssetResponseFixture.cjs');

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-static-'));
const source = Buffer.from('const Awtsmoos = "complete";\n'.repeat(200));
const assetPath = path.join(temporaryRoot, 'runtime.js');
fs.writeFileSync(assetPath, source);
fs.writeFileSync(`${assetPath}.br`, zlib.brotliCompressSync(source));
fs.writeFileSync(`${assetPath}.gz`, zlib.gzipSync(source, { mtime: 0 }));

test('B"H Brotli is selected with truthful representation headers', async () => {
	const context = staticAssetContext(assetPath, {
		headers: { 'accept-encoding': 'gzip, br' }
	});
	const result = await readStaticAsset(context);
	assert.equal(result.encoding, 'br');
	assert.deepEqual(zlib.brotliDecompressSync(result.content), source);
	assert.equal(context.response.getHeader('Content-Encoding'), 'br');
	assert.equal(
		context.response.getHeader('Content-Type'),
		'application/javascript; charset=utf-8'
	);
	assert.equal(context.response.getHeader('Vary'), 'Accept-Encoding');
	assert.match(context.response.getHeader('ETag'), /-br"$/);
});

test('B"H gzip and identity respect quality and filesystem truth', async () => {
	const gzipContext = staticAssetContext(assetPath, {
		headers: { 'accept-encoding': 'br;q=0, gzip;q=1' }
	});
	const gzipResult = await readStaticAsset(gzipContext);
	assert.equal(gzipResult.encoding, 'gzip');
	assert.deepEqual(zlib.gunzipSync(gzipResult.content), source);
	const identityContext = staticAssetContext(assetPath);
	const identityResult = await readStaticAsset(identityContext);
	assert.equal(identityResult.encoding, 'identity');
	assert.deepEqual(identityResult.content, source);
});

test('B"H matching ETag returns 304 without body or length', async () => {
	const first = staticAssetContext(assetPath, {
		headers: { 'accept-encoding': 'br' }
	});
	await readStaticAsset(first);
	const second = staticAssetContext(assetPath, {
		headers: {
			'accept-encoding': 'br',
			'if-none-match': first.response.getHeader('ETag')
		}
	});
	const result = await readStaticAsset(second);
	assert.equal(result.handled, true);
	assert.equal(second.response.statusCode, 304);
	assert.equal(second.response.body, null);
	assert.equal(second.response.getHeader('Content-Length'), undefined);
});

test('B"H HEAD preserves MIME and length while suppressing body', async () => {
	const context = staticAssetContext(assetPath, {
		headers: { 'accept-encoding': 'gzip' },
		method: 'HEAD'
	});
	const result = await readStaticAsset(context);
	assert.equal(result.handled, true);
	assert.equal(context.response.body, null);
	assert.ok(Number(context.response.getHeader('Content-Length')) > 0);
	assert.equal(context.response.getHeader('Content-Encoding'), 'gzip');
});

test('B"H content-addressed assets receive immutable cache memory', async () => {
	const hashedFolder = path.join(temporaryRoot, 'a'.repeat(64));
	fs.mkdirSync(hashedFolder);
	const hashedPath = path.join(hashedFolder, 'model.js');
	fs.writeFileSync(hashedPath, source);
	const context = staticAssetContext(hashedPath);
	await readStaticAsset(context);
	assert.equal(
		context.response.getHeader('Cache-Control'),
		'public, max-age=31536000, immutable'
	);
});
