//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file driveHttp.test.js
 * @description Proves privacy, validators, exact egress, and aggressive shared caching.
 * The Awtsmoos conceals private bytes while immutable public vessels endure in
 * browser and CDN memory without weakening mutable document revalidation.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { writeDriveFile } = require('../writeService.js');
const { updateDriveMetadata } = require('../metadataService.js');
const { readDriveState } = require('../stateRepository.js');
const {
	buildPublicPathResponse,
	buildPublicHashResponse
} = require('../publicResponse.js');
const { buildPrivatePathResponse } = require('../privateResponse.js');
const {
	IMMUTABLE,
	SHARED_IMMUTABLE,
	SURROGATE_IMMUTABLE
} = require('../cachePolicy.js');

function options($i, path, method = 'GET', headers = {}) {
	return { aliasId: 'alpha', path, method, headers, $i };
}

test('private files remain hidden and no-store', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-private-');
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'secret.txt',
		content: 'hidden',
		cachePolicy: 'immutable',
		$i
	});
	assert.equal((await buildPublicPathResponse(options($i, 'secret.txt'))).statusCode, 404);
	const privateResult = await buildPrivatePathResponse(options($i, 'secret.txt'));
	assert.equal(privateResult.response.toString(), 'hidden');
	assert.equal(privateResult.headers['Cache-Control'], 'private, no-store');
});

test('mutable paths implement validators, HEAD, ranges, and exact egress', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-public-');
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'site/index.html',
		content: 'abcdef',
		visibility: 'public',
		$i
	});
	const get = await buildPublicPathResponse(options($i, 'site'));
	assert.equal(get.headers['Cache-Control'], 'public, max-age=0, must-revalidate');
	assert.equal(get.headers['CDN-Cache-Control'], undefined);
	const head = await buildPublicPathResponse(options($i, 'site', 'HEAD'));
	assert.equal(head.response.length, 0);
	assert.equal(head.headers['Content-Length'], '6');
	const cached = await buildPublicPathResponse(options($i, 'site', 'GET', {
		'if-none-match': get.headers.ETag
	}));
	assert.equal(cached.statusCode, 304);
	const range = await buildPublicPathResponse(options($i, 'site', 'GET', {
		range: 'bytes=1-3'
	}));
	assert.equal(range.response.toString(), 'bcd');
	assert.equal(range.headers['Content-Range'], 'bytes 1-3/6');
	assert.equal((await readDriveState('alpha', $i)).usage.egressBytes, 9);
});

test('immutable hashes emit browser, CDN, and surrogate cache policy', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-immutable-');
	const written = await writeDriveFile({
		aliasId: 'alpha',
		path: 'assets/app.js',
		content: 'export default 1;',
		visibility: 'public',
		$i
	});
	assert.equal((await hashResponse($i, written.entry.objectHash)).statusCode, 404);
	await updateDriveMetadata({
		aliasId: 'alpha',
		path: 'assets/app.js',
		visibility: 'public',
		cachePolicy: 'immutable',
		$i
	});
	const result = await hashResponse($i, written.entry.objectHash);
	assert.equal(result.statusCode, 200);
	assert.equal(result.headers['Cache-Control'], IMMUTABLE);
	assert.equal(result.headers['CDN-Cache-Control'], SHARED_IMMUTABLE);
	assert.equal(result.headers['Cloudflare-CDN-Cache-Control'], SHARED_IMMUTABLE);
	assert.equal(result.headers['Surrogate-Control'], SURROGATE_IMMUTABLE);
	assert.equal(result.response.toString(), 'export default 1;');
});

function hashResponse($i, hash) {
	return buildPublicHashResponse({
		aliasId: 'alpha',
		hash,
		method: 'GET',
		headers: {},
		$i
	});
}
