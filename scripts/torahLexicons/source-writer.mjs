//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconSourceWriter
 * @description
 * Upstream evidence enters one resumable native AwtsmoosDB source vessel.
 * Completion is earned only after a fresh ordered scan proves entry and shard
 * counts; no external manifest or serialized checkpoint can claim authority.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';

const require = createRequire(import.meta.url);
const { shardToken } = require('../../geelooy/api/social/helper/search/lexicon/keySpace.js');
const RANGE_END = '\uffff';
const WRITE_OPTIONS = Object.freeze({
	compression: true,
	maxCachedPages: 16,
	dirtyPageFlushThreshold: 8,
	reuseFreedSpace: 'verified'
});

/** Produces one deterministic sorted key while keeping a source identity stable. */
export function sourceEntryKey(entry, stableId = '') {
	const normalized = String(entry?.normalized || '').trim();
	const identity = String(stableId || entry?.rid || entry?.sourceId || '').trim();
	if (!normalized || !identity) throw new Error('lexicon_source_entry_identity_required');
	return `${normalized}\u0001${identity}`;
}
/** Opens or resets one native source database and initializes its durable maps. */
export async function openSourceWriter(file, source, reset = false) {
	await fs.mkdir(path.dirname(file), { recursive: true });
	if (reset) {
		await fs.rm(file, { force: true });
		await fs.rm(`${file}.wal`, { force: true });
	}
	const database = new AwtsmoosDB(file, WRITE_OPTIONS);
	await database.open();
	if (typeof database.root.entries?.set !== 'function') {
		database.root.entries = new database.Map();
	}
	if (!database.root.source) database.root.source = { ...source };
	if (!database.root.meta) {
		database.root.meta = {
			format: 'awtsmoos-lexicon-source-v1',
			complete: false,
			entries: 0,
			shards: {}
		};
	}
	return database;
}

/** Writes one idempotent lexical entry into its sorted native source range. */
export async function putSourceEntry(database, entry, stableId = '') {
	await database.root.entries.set(sourceEntryKey(entry, stableId), entry);
}

/** Stores importer continuation state inside the same database authority. */
export async function saveSourceState(database, state) {
	database.root.importState = { ...state };
	await database.waitForIdle();
}
/** Recounts the native source, marks it complete, and proves allocator integrity. */
export async function finalizeSourceWriter(database) {
	const shards = new Map();
	let entries = 0;
	for await (const row of database.range(database.root.entries, '', RANGE_END)) {
		const entry = row?.value?.__resolve__?.() || row?.value;
		const token = shardToken(entry?.normalized);
		if (!token) continue;
		shards.set(token, (shards.get(token) || 0) + 1);
		entries += 1;
	}
	database.root.meta = {
		format: 'awtsmoos-lexicon-source-v1',
		complete: true,
		entries,
		shards: Object.fromEntries([...shards.entries()].sort())
	};
	database.root.importState = {
		complete: true,
		finishedAt: new Date().toISOString()
	};
	await database.waitForIdle();
	if (!database.verify().ok) throw new Error('lexicon_source_verify_failed');
	return { entries, shards: database.root.meta.shards };
}

/** Closes one source writer after all pending native pages settle. */
export async function closeSourceWriter(database) {
	if (!database) return;
	await database.waitForIdle();
	await database.close();
}
