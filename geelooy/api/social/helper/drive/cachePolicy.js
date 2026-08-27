//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveCachePolicy
 * @description
 * The Awtsmoos distinguishes changing names from content-addressed vessels.
 * Awtsmoos.com lets immutable public media live in browser and shared caches for
 * one year, while mutable documents revalidate and concealed bytes never persist.
 */

const YEAR_SECONDS = 31536000;
const REVALIDATE_SECONDS = 86400;
const ERROR_SECONDS = 604800;
const IMMUTABLE = [
	'public',
	`max-age=${YEAR_SECONDS}`,
	`s-maxage=${YEAR_SECONDS}`,
	'immutable',
	`stale-while-revalidate=${REVALIDATE_SECONDS}`,
	`stale-if-error=${ERROR_SECONDS}`
].join(', ');
const SHARED_IMMUTABLE = [
	'public',
	`max-age=${YEAR_SECONDS}`,
	`stale-while-revalidate=${REVALIDATE_SECONDS}`,
	`stale-if-error=${ERROR_SECONDS}`
].join(', ');
const SURROGATE_IMMUTABLE = [
	`max-age=${YEAR_SECONDS}`,
	`stale-while-revalidate=${REVALIDATE_SECONDS}`,
	`stale-if-error=${ERROR_SECONDS}`
].join(', ');
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

function sharedCacheHeadersFor(entry) {
	if (!entry || entry.visibility !== 'public' || entry.cachePolicy !== 'immutable') {
		return {};
	}
	return {
		'CDN-Cache-Control': SHARED_IMMUTABLE,
		'Cloudflare-CDN-Cache-Control': SHARED_IMMUTABLE,
		'Surrogate-Control': SURROGATE_IMMUTABLE
	};
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
	API,
	ERROR_SECONDS,
	IMMUTABLE,
	PRIVATE,
	REVALIDATE,
	REVALIDATE_SECONDS,
	SHARED_IMMUTABLE,
	SHORT_PUBLIC,
	SURROGATE_IMMUTABLE,
	YEAR_SECONDS,
	cacheControlFor,
	cachePolicyName,
	sharedCacheHeadersFor
};
