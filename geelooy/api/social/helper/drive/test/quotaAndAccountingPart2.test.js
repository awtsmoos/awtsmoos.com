//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file quotaAndAccountingPart2.test.js
 * @description Quota-shrink + retryable-pressure cases moved verbatim from quotaAndAccounting.test.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { freshDriveState } = require('../stateShape.js');
const { mergedQuota } = require('../quotaPolicy.js');
const { assertQuotaContainsUsage } = require('../quotaAdministration.js');
const { safeRoute, statusForCode } = require('../routes/routeSupport.js');

test('quota shrink rejects monthly ingress, largest files, and active leases', () => {
	const ingressState = freshDriveState();
	ingressState.usage.monthly['2026-07'] = {
		requests: 0,
		ingressBytes: 10,
		egressBytes: 0
	};
	assert.throws(
		() => assertQuotaContainsUsage(ingressState, mergedQuota({ monthlyIngressBytes: 9 })),
		error => error.code === 'QUOTA_BELOW_MONTHLY_INGRESS'
	);
	const fileState = freshDriveState();
	fileState.entries.large = { type: 'file', size: 10 };
	assert.throws(
		() => assertQuotaContainsUsage(fileState, mergedQuota({ singleFileBytes: 9 })),
		error => error.code === 'QUOTA_BELOW_SINGLE_FILE'
	);
	const leaseState = freshDriveState();
	leaseState.transferLeases.active = { expiresAt: Date.now() + 10000 };
	assert.throws(
		() => assertQuotaContainsUsage(leaseState, mergedQuota({ concurrentTransfers: 0 })),
		error => error.code === 'QUOTA_BELOW_ACTIVE_TRANSFERS'
	);
});

test('retryable pressure maps to 429 with Retry-After', async () => {
	for (const code of [
		'REQUEST_RATE_EXCEEDED',
		'UPLOAD_RATE_EXCEEDED',
		'CONCURRENT_TRANSFER_LIMIT_EXCEEDED',
		'MONTHLY_INGRESS_QUOTA_EXCEEDED',
		'MONTHLY_EGRESS_QUOTA_EXCEEDED'
	]) {
		assert.equal(statusForCode(code), 429);
	}
	const result = await safeRoute(async () => {
		const error = new Error('REQUEST_RATE_EXCEEDED');
		error.code = 'REQUEST_RATE_EXCEEDED';
		error.retryAfterSeconds = 7;
		throw error;
	});
	assert.equal(result.statusCode, 429);
	assert.equal(result.headers['Retry-After'], '7');
});