// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchShardStore
 * @description
 * One immutable shard receives one reusable read-only session. The Awtsmoos keeps
 * its persisted graph open and tunes only the in-memory search breadth, while
 * Awtsmoos.com never rewrites, expands, or re-embeds either canonical database.
 */

const fs = require('fs');
const path = require('path');
const SearchDatabase = require('./searchDatabase.js');
const { tunePersistedIndex } = require('./searchTuning.js');

const sessions = new Map();

function fingerprint(file) {
	const status = fs.statSync(file);
	return `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
}

function discoverListName(database, preferred) {
	if (preferred && database.root[preferred]) return preferred;
	return Object.keys(database.root).find(name => {
		if (name.startsWith('__')) return false;
		return typeof database.root[name]?.length === 'number';
	});
}

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

function openShardSession(shard) {
	const file = path.resolve(shard.file);
	const currentFingerprint = fingerprint(file);
	const existing = sessions.get(file);
	if (existing?.fingerprint === currentFingerprint) {
		return { ...existing, reused: true };
	}
	if (existing) closeShardSession(file);
	const database = new SearchDatabase(file);
	try {
		database.open();
		const listName = discoverListName(database, shard.listName);
		const list = listName ? database.root[listName] : null;
		if (!list) {
			throw codedError(
				'RAG_LIST_UNAVAILABLE',
				`No vector list exists in shard ${shard.id}.`
			);
		}
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
		sessions.set(file, session);
		return session;
	} catch (error) {
		database.close();
		throw error;
	}
}

function closeShardSession(file) {
	const key = path.resolve(file);
	const session = sessions.get(key);
	if (!session) return false;
	sessions.delete(key);
	session.database.close();
	return true;
}

function closeAllShardSessions() {
	for (const file of [...sessions.keys()]) closeShardSession(file);
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	closeAllShardSessions,
	closeShardSession,
	openShardSession
};
