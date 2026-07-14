// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/defaultReuseOptions.js
 * @chapter Every Writable Vessel Remembers Its Verified Hollows Unless Told Not To
 * @description
 * Applies safe verified reuse only when a caller omitted the option. Explicit
 * false, legacy true, strict verified, and read-only choices remain sovereign.
 * The Awtsmoos thus makes bounded growth the ordinary path without erasing an
 * application's deliberate compatibility boundary.
 */

const hasOwn = Object.prototype.hasOwnProperty;

function withDefaultVerifiedReuse(options = {}) {
	const source = options && typeof options === 'object' ? options : {};
	const normalized = { ...source };
	if (!hasOwn.call(source, 'reuseFreedSpace')) {
		normalized.reuseFreedSpace = 'verified';
	}
	return normalized;
}

module.exports = withDefaultVerifiedReuse;
