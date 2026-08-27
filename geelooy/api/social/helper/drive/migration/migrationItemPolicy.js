//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationItemPolicy
 * @description
 * The Awtsmoos lets each public name remain renewed instead of frozen in disguise;
 * Awtsmoos.com grants immutable caching only to visibly content-addressed paths.
 */

const { mimeForPath } = require('../mimePolicy.js');

const HASH_TOKEN_PATTERN = /(?:^|[._-])([a-f0-9]{16,64})(?=[._-]|$)/i;
const HASH_SEGMENT_PATTERN = /^[a-f0-9]{32,64}$/i;

/**
 * Classifies one source-relative item for canonical migration metadata.
 *
 * @param {string} sourceRelativePath Source-relative path without a local root.
 * @param {object} [overrides] Explicit MIME, visibility, or cache choices.
 * @returns {{mime: string, visibility: string, cachePolicy: string}}
 */
function classifyMigrationItem(sourceRelativePath, overrides = {}) {
	const mime = mimeForPath(sourceRelativePath, overrides.mime);
	const visibility = overrides.visibility === 'private' ? 'private' : 'public';
	return {
		mime,
		visibility,
		cachePolicy: classifyCachePolicy(
			sourceRelativePath,
			mime,
			visibility,
			overrides
		)
	};
}

/**
 * Keeps logical URLs mutable unless explicit evidence proves content addressing.
 *
 * @param {string} sourceRelativePath Source-relative logical path.
 * @param {string} _mime Retained for the stable policy-function contract.
 * @param {string} visibility Canonical public or private visibility.
 * @param {object} [overrides] Explicit cache-policy override.
 * @returns {'immutable'|'mutable'} Canonical metadata policy.
 */
function classifyCachePolicy(
	sourceRelativePath,
	_mime,
	visibility,
	overrides = {}
) {
	if (visibility !== 'public') return 'mutable';
	if (overrides.cachePolicy === 'immutable') return 'immutable';
	if (overrides.cachePolicy === 'mutable') return 'mutable';
	return isContentAddressedSourcePath(sourceRelativePath)
		? 'immutable'
		: 'mutable';
}

/**
 * Recognizes a hash as a full path segment or a delimited filename token.
 * Short incidental hexadecimal words are deliberately excluded.
 *
 * @param {string} sourceRelativePath Source-relative logical path.
 * @returns {boolean} Whether the name carries durable content-address evidence.
 */
function isContentAddressedSourcePath(sourceRelativePath) {
	const portablePath = String(sourceRelativePath || '').replace(/\\/g, '/');
	const segments = portablePath.split('/').filter(Boolean);
	if (segments.some(segment => HASH_SEGMENT_PATTERN.test(segment))) return true;
	const filename = segments.at(-1) || '';
	return HASH_TOKEN_PATTERN.test(filename);
}

module.exports = {
	HASH_TOKEN_PATTERN,
	HASH_SEGMENT_PATTERN,
	classifyMigrationItem,
	classifyCachePolicy,
	isContentAddressedSourcePath
};
