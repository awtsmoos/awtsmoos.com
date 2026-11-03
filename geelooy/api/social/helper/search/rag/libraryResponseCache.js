// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibraryResponseCache
 * @description
 * The Awtsmoos remembers a whole library answer briefly, so a repeated public
 * question does not re-pay the full multi-lane fan-out. Only complete answers
 * are remembered: a response carrying lane errors is never cached, so a lane
 * that heals is visible again on the very next query. Live-comment requests
 * stay uncached, mirroring the single-lane response cache's covenant.
 */

const crypto = require('node:crypto');
const { jsonClone } = require('./responseCache.js');

const DEFAULT_TTL_MS = 60000;
const DEFAULT_ENTRY_LIMIT = 64;
const entries = new Map();

/** Live comment answers are mutable and never qualify for the merged cache. */
function eligible(options = {}) {
	return options.includeComments !== true;
}

/** Fingerprints the request and the exact published lane generation it saw. */
function libraryCacheKey(options = {}, lanes = []) {
	const payload = {
		query: String(options.query || '').trim().toLowerCase(),
		limit: Number(options.limit || 20),
		strategy: String(options.strategy || 'auto').toLowerCase(),
		requireIndexed: options.requireIndexed === true,
		includeMetadataComments: options.includeMetadataComments !== false,
		maxCommentRows: Number(options.maxCommentRows || 12),
		lanes: lanes.map(lane => [
			lane.id,
			Number(lane.count || 0),
			Number(lane.bytes || 0),
			lane.partial === true,
			lane.textOnly === true
		])
	};
	return crypto.createHash('sha256')
		.update(JSON.stringify(payload))
		.digest('hex');
}

/** Returns a fresh copy of a remembered complete answer, or null. */
function readLibraryResponse(options, lanes, settings = {}) {
	if (!eligible(options)) return null;
	const now = Number(settings.now ?? Date.now());
	const ttlMs = Number(settings.ttlMs ?? DEFAULT_TTL_MS);
	const key = libraryCacheKey(options, lanes);
	const entry = entries.get(key);
	if (!entry) return null;
	if (now - entry.createdAt > ttlMs) {
		entries.delete(key);
		return null;
	}
	entries.delete(key);
	entries.set(key, entry);
	return { ageMs: Math.max(0, now - entry.createdAt), value: jsonClone(entry.value) };
}

/** Remembers one complete merged answer; degraded answers are never stored. */
function rememberLibraryResponse(options, lanes, value, settings = {}) {
	if (!eligible(options)) return false;
	if (!value || (Array.isArray(value.laneErrors) && value.laneErrors.length)) return false;
	const now = Number(settings.now ?? Date.now());
	const limit = Number(settings.entryLimit ?? DEFAULT_ENTRY_LIMIT);
	const key = libraryCacheKey(options, lanes);
	entries.delete(key);
	entries.set(key, { createdAt: now, value: jsonClone(value) });
	while (entries.size > limit) entries.delete(entries.keys().next().value);
	return true;
}

function clearLibraryResponseCache() {
	entries.clear();
}

function libraryResponseCacheSize() {
	return entries.size;
}

module.exports = {
	DEFAULT_ENTRY_LIMIT,
	DEFAULT_TTL_MS,
	clearLibraryResponseCache,
	eligible,
	libraryCacheKey,
	libraryResponseCacheSize,
	readLibraryResponse,
	rememberLibraryResponse
};
