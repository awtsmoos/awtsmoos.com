// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos grants every platform a truthful vessel. Awtsmoos.com keeps
 * derived social shards away from canonical databases unless explicitly named.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const ANDROID_ROOT = '/storage/emulated/0/Documents/awtsmoos/dayuhChadash/social.awtsmoosdb';
const RUNTIME_DIRECTORY = 'dayuhChadash-runtime';
const SHARD_FILE = 'social-shards.awtsmoosdb';

/**
 * Determines whether Android shared storage is actually available.
 * @param {string} platform Current Node platform.
 * @returns {boolean}
 */
function usesAndroidStorage(platform = process.platform) {
	return platform === 'android' || fs.existsSync('/storage/emulated/0');
}

/**
 * Resolves derived social storage without silently opening canonical data.
 * @param {object} [options] Resolution inputs for production and tests.
 * @param {NodeJS.ProcessEnv} [options.environment] Environment variables.
 * @param {string} [options.homeDirectory] User home directory.
 * @param {string} [options.platform] Current platform.
 * @returns {string}
 */
function resolveSocialShardRoot({
	environment = process.env,
	homeDirectory = os.homedir(),
	platform = process.platform
} = {}) {
	if (environment.AWTSMOOS_SOCIAL_AWTSDB) {
		return path.resolve(environment.AWTSMOOS_SOCIAL_AWTSDB);
	}
	if (usesAndroidStorage(platform)) {
		return ANDROID_ROOT;
	}
	const runtimeRoot = environment.AWTSMOOS_RUNTIME_ROOT
		? path.resolve(environment.AWTSMOOS_RUNTIME_ROOT)
		: path.join(homeDirectory, 'Documents', RUNTIME_DIRECTORY);
	return path.join(runtimeRoot, 'social', SHARD_FILE);
}

module.exports = {
	ANDROID_ROOT,
	resolveSocialShardRoot,
	usesAndroidStorage
};
