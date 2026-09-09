// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shardSessionCache.js
 * @module RagShardSessionCache
 * @description
 * The Awtsmoos keeps only a small LRU covenant of immutable shard sessions.
 * Every eviction closes its database immediately, bounding descriptors and page
 * caches even when many Torah corpora and multipart generations are explored.
 */

const path = require('path');

const MAX_SHARD_SESSIONS = 8;
const sessions = new Map();

/** Closes one session without allowing cleanup failure to corrupt cache state. */
function closeSession(session) {
	try {
		session?.database?.close?.();
	} catch (_error) {}
}

/** Removes one normalized path and closes its database exactly once. */
function removeSession(file) {
	const key = path.resolve(file);
	const session = sessions.get(key);
	if (!session) return false;
	sessions.delete(key);
	closeSession(session);
	return true;
}

/** Returns a matching session and moves it to the newest LRU position. */
function getSession(file, fingerprint) {
	const key = path.resolve(file);
	const session = sessions.get(key);
	if (!session) return null;
	if (session.fingerprint !== fingerprint) {
		removeSession(key);
		return null;
	}
	sessions.delete(key);
	sessions.set(key, session);
	return session;
}

/** Installs one session and closes oldest entries until the hard cap is satisfied. */
function putSession(session) {
	const key = path.resolve(session.file);
	if (sessions.has(key)) removeSession(key);
	while (sessions.size >= MAX_SHARD_SESSIONS) {
		const oldest = sessions.keys().next().value;
		removeSession(oldest);
	}
	sessions.set(key, session);
	return session;
}

/** Closes every cached database, primarily for shutdown and deterministic tests. */
function closeAllSessions() {
	for (const file of [...sessions.keys()]) removeSession(file);
}

/** Exposes tiny cache testimony without leaking live database objects. */
function sessionCacheStatus() {
	return {
		count: sessions.size,
		maximum: MAX_SHARD_SESSIONS,
		files: [...sessions.keys()]
	};
}

module.exports = {
	MAX_SHARD_SESSIONS,
	closeAllSessions,
	getSession,
	putSession,
	removeSession,
	sessionCacheStatus
};
