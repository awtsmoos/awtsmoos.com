//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DirectSitePathPolicy
 * @description
 * The Awtsmoos reveals public source only through one mapped root while hidden
 * metadata remains concealed. Awtsmoos.com rejects private garments even when
 * the surrounding hosted folder has intentionally been published directly.
 */

const RESERVED_SEGMENTS = new Set([
	'.awtsmoos',
	'.git',
	'.hg',
	'.svn',
	'.trash',
	'.snapshot',
	'.snapshots',
	'.recovery'
]);

const PRIVATE_EXTENSIONS = new Set([
	'.key',
	'.p12',
	'.pfx'
]);

/**
 * Assert that a relative direct-site path contains no reserved private source.
 *
 * @param {string} relativePath Path below the already-bound source root.
 * @returns {string} Normalized slash-separated relative path.
 */
function assertDirectPublicPath(relativePath = '') {
	const parts = String(relativePath || '')
		.replace(/\\/g, '/')
		.split('/')
		.filter(Boolean);

	for (const part of parts) {
		assertPublicSegment(part);
	}

	return parts.join('/');
}

function assertPublicSegment(segment) {
	const value = String(segment || '').trim();
	const lower = value.toLowerCase();
	if (!value || value === '.' || value === '..') {
		throw privatePathError('DIRECT_SITE_PATH_FORBIDDEN');
	}
	if (RESERVED_SEGMENTS.has(lower) || /^\.env(?:\.|$)/i.test(value)) {
		throw privatePathError('DIRECT_SITE_PATH_PRIVATE');
	}
	if (PRIVATE_EXTENSIONS.has(extensionOf(lower)) || looksLikePrivateKey(lower)) {
		throw privatePathError('DIRECT_SITE_PATH_PRIVATE');
	}
}

function looksLikePrivateKey(value) {
	return /^(?:id_(?:rsa|dsa|ecdsa|ed25519)|private[-_.]?key)(?:\.|$)/i.test(value);
}

function extensionOf(value) {
	const index = value.lastIndexOf('.');
	return index >= 0 ? value.slice(index) : '';
}

function privatePathError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	RESERVED_SEGMENTS,
	assertDirectPublicPath,
	privatePathError
};
