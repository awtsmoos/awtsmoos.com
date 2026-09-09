// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shardStore.js
 * @module SearchShardStore
 * @description
 * Immutable RAG shards open through reviewed list names and a tiny LRU session
 * covenant. Awtsmoos.com never enumerates a giant root to guess a list and never
 * retains every corpus database merely because one process touched it once.
 */

const fs = require('fs');
const path = require('path');
const SearchDatabase = require('./searchDatabase.js');
const {
	closeAllSessions,
	getSession,
	putSession,
	removeSession,
	sessionCacheStatus
} = require('./shardSessionCache.js');
const { tunePersistedIndex } = require('./searchTuning.js');

/** Fingerprints immutable publication identity without reading corpus payloads. */
function fingerprint(file) {
	const status = fs.statSync(file);
	return `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
}

/** Requires the exact reviewed list name instead of discovering by root enumeration. */
function discoverListName(database, preferred, shardId = 'unknown') {
	if (!preferred) {
		throw codedError('RAG_LIST_NAME_REQUIRED', `Shard ${shardId} has no reviewed vector list name.`);
	}
	if (!database.root[preferred]) {
		throw codedError('RAG_LIST_UNAVAILABLE', `Vector list ${preferred} is unavailable in shard ${shardId}.`);
	}
	return preferred;
}

/** Converts persisted HNSW metadata into compact request-readiness testimony. */
function statusFor(index) {
	const registryCount = index ? index.registry.count() : 0;
	return {
		configured: Boolean(index),
		registryCount,
		entryNodeID: index?.entryNodeID ?? -1,
		maxLevel: Number(index?.maxLevel || 0),
		efSearch: Number(index?.efSearch || 0),
		usable: registryCount > 0 && index?.entryNodeID >= 0
	};
}

/** Opens or reuses one immutable shard without exceeding the global session cap. */
function openShardSession(shard) {
	const file = path.resolve(shard.file);
	const currentFingerprint = fingerprint(file);
	const existing = getSession(file, currentFingerprint);
	if (existing) return { ...existing, reused: true };
	const database = new SearchDatabase(file);
	try {
		database.open();
		const listName = discoverListName(database, shard.listName, shard.id);
		const list = database.root[listName];
		const index = database.vector.getIndex(list);
		tunePersistedIndex(index);
		const session = {
			database,
			file,
			fingerprint: currentFingerprint,
			index,
			list,
			listName,
			status: statusFor(index),
			reused: false
		};
		putSession(session);
		return session;
	} catch (error) {
		database.close();
		throw error;
	}
}

function closeShardSession(file) {
	return removeSession(file);
}

function closeAllShardSessions() {
	closeAllSessions();
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	closeAllShardSessions,
	closeShardSession,
	discoverListName,
	openShardSession,
	sessionCacheStatus
};
