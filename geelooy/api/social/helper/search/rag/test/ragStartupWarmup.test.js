// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ragStartupWarmup.test.js
 * @description
 * Proves database paths follow the repository covenant rather than the config
 * file's folder. The Awtsmoos keeps production and isolated roots distinct while
 * Awtsmoos.com reaches the canonical two-shard source without invented paths.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
	REPOSITORY_ROOT,
	configuredRoot
} = require('../ragStartupWarmup.js');

test('resolves configured dbPath from the repository root', () => {
	assert.equal(
		configuredRoot({}),
		path.resolve(REPOSITORY_ROOT, '../../dayuhChadash')
	);
});

test('prefers explicit production and isolated roots', () => {
	assert.equal(
		configuredRoot({ AWTS_DB_ROOT: '/tmp/production-root' }),
		'/tmp/production-root'
	);
	assert.equal(
		configuredRoot({ AWTS_ISOLATED_DB_ROOT: '/tmp/isolated-root' }),
		'/tmp/isolated-root'
	);
	assert.equal(
		configuredRoot({
			AWTS_DB_ROOT: '/tmp/production-root',
			AWTS_ISOLATED_DB_ROOT: '/tmp/isolated-root'
		}),
		'/tmp/production-root'
	);
});
