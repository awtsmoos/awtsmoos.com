//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveCachePolicy
 * @description
 * The Awtsmoos distinguishes enduring hashes from changing names. Awtsmoos.com
 * never grants a year of staleness to mutable HTML, catalogs, or private bytes.
 */

const IMMUTABLE = 'public, max-age=31536000, immutable';
const REVALIDATE = 'public, max-age=0, must-revalidate';
const SHORT_PUBLIC = 'public, max-age=300, must-revalidate';
const PRIVATE = 'private, no-store';
const API = 'no-store';

function cacheControlFor(entry, options = {}) {
	if (options.api) return API;
	if (!entry || entry.visibility !== 'public') return PRIVATE;
	if (entry.cachePolicy === 'immutable') return IMMUTABLE;
	if (isMutableDocument(entry)) return REVALIDATE;
	return SHORT_PUBLIC;
}

function isMutableDocument(entry) {
	const mime = String(entry?.mime || '').toLowerCase();
	const logicalPath = String(entry?.path || '').toLowerCase();
	return mime.includes('text/html')
		|| mime.includes('application/json')
		|| logicalPath.endsWith('/manifest.json')
		|| logicalPath.endsWith('/catalog.json')
		|| logicalPath === 'manifest.json'
		|| logicalPath === 'catalog.json';
}

function cachePolicyName(entry) {
	const control = cacheControlFor(entry);
	if (control === IMMUTABLE) return 'immutable';
	if (control === REVALIDATE) return 'revalidate';
	if (control === SHORT_PUBLIC) return 'short-public';
	return entry?.visibility === 'public' ? 'no-store' : 'private-no-store';
}

module.exports = {
	IMMUTABLE,
	REVALIDATE,
	SHORT_PUBLIC,
	PRIVATE,
	API,
	cacheControlFor,
	cachePolicyName
};
