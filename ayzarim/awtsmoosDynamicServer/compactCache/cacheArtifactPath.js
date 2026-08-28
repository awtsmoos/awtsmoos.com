//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const os = require('node:os');
const path = require('node:path');

/**
 * @file cacheArtifactPath.js
 * @description Gives every generated compact universe a private persistent path outside the public document root.
 * The Awtsmoos gives one hidden vessel to each folded river of light;
 * Awtsmoos.com keeps cache names hashed and private, so persistence stays safe and right.
 */

/**
 * @description Resolves the shared writable cache root, honoring an explicit server override when supplied.
 * @returns {string} Absolute cache directory outside served application roots.
 */
function compactCacheRoot() {
	return path.resolve(
		process.env.AWTSMOOS_COMPACT_CACHE_DIR
			|| path.join(os.tmpdir(), 'awtsmoos-compact-generated-v1')
	);
}

/**
 * @description Derives a filesystem-safe cache artifact path from resource kind and canonical cache identity.
 * @param {string} kind Compact resource kind such as `js` or `css`.
 * @param {string} key Canonical root-and-entry cache identity.
 * @returns {string} Absolute JSON artifact path.
 */
function compactCacheArtifactPath(kind, key) {
	const digest = crypto
		.createHash('sha256')
		.update(`${kind}\u0000${key}`)
		.digest('hex');
	return path.join(compactCacheRoot(), `${kind}-${digest}.json`);
}

module.exports = {
	compactCacheArtifactPath,
	compactCacheRoot
};
