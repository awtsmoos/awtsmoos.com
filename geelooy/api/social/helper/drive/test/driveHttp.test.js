//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file driveHttp.test.js
 * @description
 * The Awtsmoos tests concealed and revealed bytes across validators, ranges,
 * caching, and egress. Awtsmoos.com proves public paths never leak private files.
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

function responseOptions($i, path, method = 'GET', headers = {}) {
	return {
		aliasId: 'alpha',
		path,
		method,
		headers,
		$i
	};
}

test('public serving hides private files while owner retrieval remains no-store', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-private-');
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'secret.txt',
		content: 'hidden',
		cachePolicy: 'immutable',
		$i
	});
	const publicResult = await buildPublicPathResponse(responseOptions($i, 'secret.txt'));
	assert.equal(publicResult.statusCode, 404);
	const privateResult = await buildPrivatePathResponse(responseOptions($i, 'secret.txt'));
	assert.equal(privateResult.statusCode, 200);
	assert.equal(privateResult.response.toString(), 'hidden');
	assert.equal(privateResult.headers['Cache-Control'], 'private, no-store');
	const state = await readDriveState('alpha', $i);
	const hashResult = await buildPublicHashResponse({
		aliasId: 'alpha',
		hash: state.entries['secret.txt'].objectHash,
		method: 'GET',
		headers: {},
		$i
	});
	assert.equal(hashResult.statusCode, 404);
});

test('public logical paths implement validators, HEAD, ranges, MIME, and egress', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-public-');
	const written = await writeDriveFile({
		aliasId: 'alpha',
		path: 'site/index.html',
		content: 'abcdef',
		visibility: 'public',
		$i
	});
	const getResult = await buildPublicPathResponse(responseOptions($i, 'site'));
	assert.equal(getResult.statusCode, 200);
	assert.equal(getResult.response.toString(), 'abcdef');
	assert.equal(getResult.headers['Content-Type'], 'text/html; charset=utf-8');
	assert.equal(getResult.headers['Cache-Control'], 'public, max-age=0, must-revalidate');
	assert.equal(getResult.headers['Access-Control-Allow-Origin'], '*');
	const headResult = await buildPublicPathResponse(responseOptions($i, 'site', 'HEAD'));
	assert.equal(headResult.statusCode, 200);
	assert.equal(headResult.response.length, 0);
	assert.equal(headResult.headers['Content-Length'], '6');
	const notModified = await buildPublicPathResponse(responseOptions($i, 'site', 'GET', {
		'if-none-match': getResult.headers.ETag
	}));
	assert.equal(notModified.statusCode, 304);
	assert.equal(notModified.response.length, 0);
	const rangeResult = await buildPublicPathResponse(responseOptions($i, 'site', 'GET', {
		range: 'bytes=1-3'
	}));
	assert.equal(rangeResult.statusCode, 206);
	assert.equal(rangeResult.response.toString(), 'bcd');
	assert.equal(rangeResult.headers['Content-Range'], 'bytes 1-3/6');
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.egressBytes, 9);
	assert.equal(written.entry.objectHash, state.entries['site/index.html'].objectHash);
});

test('immutable hashes require public immutable metadata', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-immutable-');
	const written = await writeDriveFile({
		aliasId: 'alpha',
		path: 'assets/app.js',
		content: 'export default 1;',
		visibility: 'public',
		$i
	});
	let result = await buildPublicHashResponse({
		aliasId: 'alpha',
		hash: written.entry.objectHash,
		method: 'GET',
		headers: {},
		$i
	});
	assert.equal(result.statusCode, 404);
	await updateDriveMetadata({
		aliasId: 'alpha',
		path: 'assets/app.js',
		visibility: 'public',
		cachePolicy: 'immutable',
		$i
	});
	result = await buildPublicHashResponse({
		aliasId: 'alpha',
		hash: written.entry.objectHash,
		method: 'GET',
		headers: {},
		$i
	});
	assert.equal(result.statusCode, 200);
	assert.equal(result.headers['Cache-Control'], 'public, max-age=31536000, immutable');
	assert.equal(result.response.toString(), 'export default 1;');
});
