// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos proves every platform receives an isolated social-shard vessel. */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
	ANDROID_ROOT,
	resolveSocialShardRoot
} = require('../shardRoot.js');

const HOME = path.join(path.sep, 'Users', 'tester');

test('explicit shard path always wins', () => {
	const requested = path.join(path.sep, 'tmp', 'explicit-social.awtsmoosdb');
	const result = resolveSocialShardRoot({
		environment: { AWTSMOOS_SOCIAL_AWTSDB: requested },
		homeDirectory: HOME,
		platform: 'darwin'
	});
	assert.equal(result, requested);
});

test('desktop fallback uses isolated runtime storage', () => {
	const result = resolveSocialShardRoot({
		environment: {},
		homeDirectory: HOME,
		platform: 'darwin'
	});
	assert.equal(
		result,
		path.join(HOME, 'Documents', 'dayuhChadash-runtime', 'social', 'social-shards.awtsmoosdb')
	);
	assert(!result.includes('dayuhChadash/social.awtsmoosdb'));
});

test('runtime root can be explicitly isolated', () => {
	const runtimeRoot = path.join(path.sep, 'tmp', 'awtsmoos-runtime');
	const result = resolveSocialShardRoot({
		environment: { AWTSMOOS_RUNTIME_ROOT: runtimeRoot },
		homeDirectory: HOME,
		platform: 'linux'
	});
	assert.equal(result, path.join(runtimeRoot, 'social', 'social-shards.awtsmoosdb'));
});

test('android preserves the established shared-storage location', () => {
	const result = resolveSocialShardRoot({
		environment: {},
		homeDirectory: HOME,
		platform: 'android'
	});
	assert.equal(result, ANDROID_ROOT);
});
