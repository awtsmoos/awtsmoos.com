// B"H
// Boruch Hashem
// Blessed is He

/** @file policy.test.js @description Proves portable Awtsmoos.com path policy. */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
	configuredPolicy,
	destinationFor,
	quarantinePath
} = require('../policy.js');

test('environment roots replace every machine-specific default', () => {
	const policy = configuredPolicy({
		AWTSMOOS_DOCUMENTS_ROOT: '/tmp/documents',
		AWTSMOOS_REPOSITORY_ROOT: '/tmp/repository',
		AWTSMOOS_DB_ROOT: '/tmp/data',
		AWTSMOOS_RUNTIME_ROOT: '/tmp/runtime',
		AWTSMOOS_REVIEW_ROOT: '/tmp/review',
		AWTSMOOS_CUTOVER_QUARANTINE_ROOT: '/tmp/quarantine',
		AWTSMOOS_STORAGE_HARD_BYTES: '1234',
		AWTSMOOS_RUNTIME_ASSET_HARD_BYTES: '5678',
		PORT: '9090'
	});
	assert.equal(policy.dataRoot, '/tmp/data');
	assert.equal(policy.aiDestination, '/tmp/runtime/ai');
	assert.equal(policy.cutoverStateFile, '/tmp/quarantine/cutover-state.json');
	assert.equal(policy.dataHardLimitBytes, 1234);
	assert.equal(policy.runtimeHardLimitBytes, 5678);
	assert.equal(policy.port, 9090);
});

test('AI moves to runtime while social shadows move to quarantine', () => {
	const policy = configuredPolicy({
		AWTSMOOS_DB_ROOT: '/tmp/data',
		AWTSMOOS_RUNTIME_ROOT: '/tmp/runtime',
		AWTSMOOS_CUTOVER_QUARANTINE_ROOT: '/tmp/quarantine'
	});
	assert.equal(destinationFor(policy, policy.aiSource), '/tmp/runtime/ai');
	const raw = path.join(policy.dataRoot, 'social');
	assert.equal(
		quarantinePath(policy, raw),
		'/tmp/quarantine/data-root/social'
	);
});
