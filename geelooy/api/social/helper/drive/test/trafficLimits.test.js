//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file trafficLimits.test.js
 * @description
 * The Awtsmoos tests measured gates before traffic enters or leaves its vessel.
 * Awtsmoos.com proves rate, ingress, egress, and concurrent leases remain exact.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const {
	beginDriveRequest,
	finishDriveRequest,
	abortDriveRequest,
	getDriveUsage
} = require('../usageService.js');
const { mutateDriveState, readDriveState } = require('../stateRepository.js');

async function setQuota(aliasId, $i, values) {
	await mutateDriveState(aliasId, $i, state => {
		Object.assign(state.quota, values);
	});
}

test('enforces request and upload rates without charging rejected attempts', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-rates-');
	await setQuota('alpha', $i, {
		requestsPerMinute: 2,
		uploadRequestsPerMinute: 1
	});
	await beginDriveRequest('alpha', { upload: true, ingressBytes: 2 }, $i);
	await assert.rejects(
		beginDriveRequest('alpha', { upload: true, ingressBytes: 2 }, $i),
		error => error.code === 'UPLOAD_RATE_EXCEEDED'
	);
	await beginDriveRequest('alpha', {}, $i);
	await assert.rejects(
		beginDriveRequest('alpha', {}, $i),
		error => error.code === 'REQUEST_RATE_EXCEEDED'
	);
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.requests, 2);
	assert.equal(state.usage.ingressBytes, 2);
});

test('enforces monthly ingress before counters change', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-ingress-');
	await setQuota('alpha', $i, { monthlyIngressBytes: 3 });
	await beginDriveRequest('alpha', { upload: true, ingressBytes: 3 }, $i);
	await assert.rejects(
		beginDriveRequest('alpha', { upload: true, ingressBytes: 1 }, $i),
		error => error.code === 'MONTHLY_INGRESS_QUOTA_EXCEEDED'
	);
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.ingressBytes, 3);
	assert.equal(state.usage.requests, 1);
});

test('rejects excess egress and releases the denied transfer lease', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-egress-');
	await setQuota('alpha', $i, { monthlyEgressBytes: 3 });
	let traffic = await beginDriveRequest('alpha', { transfer: true }, $i);
	await finishDriveRequest('alpha', traffic.leaseId, 3, $i);
	traffic = await beginDriveRequest('alpha', { transfer: true }, $i);
	await assert.rejects(
		finishDriveRequest('alpha', traffic.leaseId, 1, $i),
		error => error.code === 'MONTHLY_EGRESS_QUOTA_EXCEEDED'
	);
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.egressBytes, 3);
	assert.equal(Object.keys(state.transferLeases).length, 0);
});

test('enforces concurrent transfers and permits reuse after abort', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-concurrent-');
	await setQuota('alpha', $i, { concurrentTransfers: 1 });
	const first = await beginDriveRequest('alpha', { transfer: true }, $i);
	await assert.rejects(
		beginDriveRequest('alpha', { transfer: true }, $i),
		error => error.code === 'CONCURRENT_TRANSFER_LIMIT_EXCEEDED'
	);
	await abortDriveRequest('alpha', first.leaseId, $i);
	const replacement = await beginDriveRequest('alpha', { transfer: true }, $i);
	assert.ok(replacement.leaseId);
	await abortDriveRequest('alpha', replacement.leaseId, $i);
	assert.equal((await getDriveUsage('alpha', $i)).activeTransfers, 0);
});

test('prunes expired transfer leases before concurrency checks', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-expired-');
	await setQuota('alpha', $i, { concurrentTransfers: 1 });
	await mutateDriveState('alpha', $i, state => {
		state.transferLeases.expired = {
			id: 'expired',
			kind: 'download',
			expiresAt: Date.now() - 1
		};
	});
	const traffic = await beginDriveRequest('alpha', { transfer: true }, $i);
	assert.ok(traffic.leaseId);
	await abortDriveRequest('alpha', traffic.leaseId, $i);
});
