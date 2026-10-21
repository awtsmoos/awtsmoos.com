//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file quotaAndAccounting.test.js
 * @description
 * The Awtsmoos tests hidden obligations after success and failure. Awtsmoos.com
 * proves accepted ingress, zero-body responses, warnings, and quota shrink truth.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { writeDriveFile } = require('../writeService.js');
const { buildPrivatePathResponse } = require('../privateResponse.js');
const { mutateDriveState, readDriveState } = require('../stateRepository.js');
const { getDriveUsage } = require('../usageService.js');

test('failed storage commit retains accepted ingress and releases transient state', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-failed-upload-');
	await mutateDriveState('alpha', $i, state => {
		state.quota.storageBytes = 1;
		state.quota.singleFileBytes = 10;
	});
	await assert.rejects(
		writeDriveFile({ aliasId: 'alpha', path: 'large.txt', content: 'four', $i }),
		error => error.code === 'STORAGE_QUOTA_EXCEEDED'
	);
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.requests, 1);
	assert.equal(state.usage.ingressBytes, 4);
	assert.equal(state.usage.storedBytes, 0);
	assert.equal(Object.keys(state.transferLeases).length, 0);
	assert.equal(Object.keys(state.reservations).length, 0);
});

test('private GET and range charge exact egress while HEAD and 304 charge zero', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-private-meter-');
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'secret.txt',
		content: 'abcdef',
		$i
	});
	const common = {
		aliasId: 'alpha',
		path: 'secret.txt',
		$i
	};
	const get = await buildPrivatePathResponse({ ...common, method: 'GET', headers: {} });
	assert.equal(get.response.toString(), 'abcdef');
	const head = await buildPrivatePathResponse({ ...common, method: 'HEAD', headers: {} });
	assert.equal(head.response.length, 0);
	assert.equal(head.headers['Content-Length'], '6');
	const cached = await buildPrivatePathResponse({
		...common,
		method: 'GET',
		headers: { 'if-none-match': get.headers.ETag }
	});
	assert.equal(cached.statusCode, 304);
	const range = await buildPrivatePathResponse({
		...common,
		method: 'GET',
		headers: { range: 'bytes=1-2' }
	});
	assert.equal(range.response.toString(), 'bc');
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.egressBytes, 8);
	assert.equal(Object.keys(state.transferLeases).length, 0);
});

test('usage exposes soft warnings at exactly eighty percent', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-warning-');
	await mutateDriveState('alpha', $i, state => {
		state.quota.storageBytes = 10;
		state.usage.storedBytes = 8;
	});
	const result = await getDriveUsage('alpha', $i);
	const warning = result.warnings.find(item => item.metric === 'storageBytes');
	assert.equal(warning.used, 8);
	assert.equal(warning.limit, 10);
	assert.equal(warning.ratio, 0.8);
});