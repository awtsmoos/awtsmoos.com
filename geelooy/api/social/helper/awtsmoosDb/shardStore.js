// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosDbShardStore
 * @description The Awtsmoos gives derived mirrors an isolated vessel. Awtsmoos.com
 * never chooses canonical storage unless an explicit environment path requests it.
 */
const fs = require('fs');
const path = require('path');
const { resolveEngine } = require('./shardEngine.js');
const { resolveSocialShardRoot } = require('./shardRoot.js');
// B"H 2026-11-11 (json-migration M1 prep): free-space maintenance for
// the shard vessel. The DosDB adapter wires maintainFreeSpaceThrottled
// for the family vessels from its delayed-flush timer; this store
// opens its own handle and nothing ever called maintenance (or
// waitForIdle) on it, so freed space in the shard vessel would never
// be reused — the exact grow-forever disease the JSONL migration is
// meant to kill (ayzarim/DosDB/awtsmoosDbMaintenance.js header).
// Required defensively: if the module cannot be found, the store
// keeps working exactly as before and maintenance is simply off.
let maintainFreeSpaceThrottled = null;
try {
	({ maintainFreeSpaceThrottled } = require('../../../../../ayzarim/DosDB/awtsmoosDbMaintenance.js'));
} catch (_error) {
	maintainFreeSpaceThrottled = null;
}

const ROOT = resolveSocialShardRoot();
const ROOT_KEY = 'socialShards';
let database;

function openDb() {
	if (database) return database;
	fs.mkdirSync(path.dirname(ROOT), { recursive: true });
	const AwtsmoosDB = resolveEngine();
	database = new AwtsmoosDB(ROOT, {
		compression: true,
		reuseFreedSpace: 'verified',
		versions: false,
		virtualFsCompression: true
		// B"H §8.5: WAL on (engine default) — see openHeichelFsDb.
	});
	database.open();
	scheduleShardMaintenance();
	return database;
}

// Mirrors AwtsmoosDbFsAdapter.scheduleSharedFlush (the family-vessel
// pattern): a deduped one-shot timer, unref'd, 300000 ms out; on fire
// it attempts the fs flush and then the throttled free-space
// maintenance, each in its own try/catch so neither can break the
// store. maintainFreeSpaceThrottled itself re-throttles per file and
// no-ops unless the allocator flagged _needsComplementRefresh, so
// scheduling is cheap and safe to call on every write.
const MAINTENANCE_DELAY_MS = 300000;
const maintenanceTimers = new Map(); // file -> timeout
function scheduleShardMaintenance() {
	if (!maintainFreeSpaceThrottled || !database) return { scheduled: false };
	const file = ROOT;
	if (maintenanceTimers.has(file)) return { scheduled: true, alreadyQueued: true, delayMs: MAINTENANCE_DELAY_MS };
	const timer = setTimeout(() => {
		maintenanceTimers.delete(file);
		if (!database) return;
		try { database.fs?.flush?.(); } catch (error) { console.error("B\"H AwtsmoosDB delayed fs flush failed", file, error?.stack || error); }
		try { maintainFreeSpaceThrottled(database, file); } catch (maintError) { console.error("B\"H free-space maintenance hook failed", maintError && maintError.stack || maintError); }
	}, MAINTENANCE_DELAY_MS);
	if (typeof timer.unref === 'function') timer.unref();
	maintenanceTimers.set(file, timer);
	return { scheduled: true, delayMs: MAINTENANCE_DELAY_MS };
}

function key(parts = []) {
	return parts.map(v => String(v ?? '').replace(/[\u0000/\\]/g, '_')).join('/');
}
function encode(value) {
	return encodeURIComponent(String(value || 'root')).replace(/%/g, '~');
}
function decode(value) {
	return decodeURIComponent(String(value || '').replace(/~/g, '%'));
}
function pathFor(shard, parts = []) {
	return `${encode(shard)}/${encode(key(parts))}`;
}
function shardPath(shard) {
	return encode(shard);
}
function clone(value) {
	return value == null ? value : JSON.parse(JSON.stringify(value));
}
function dos() {
	return openDb().DosDB;
}

function put({ shard: shardName = 'core', parts = [], value, meta = {} }) {
	const record = {
		key: key(parts),
		parts,
		value: clone(value),
		meta: clone(meta),
		updatedAt: Date.now()
	};
	// Engine-fix (blob representation): the record is stored as ONE
	// serialized string body instead of a dictionary subtree (~45
	// allocator nodes per record — the churn behind the 136,066-range
	// free list and 6.85 ms/record lists). Envelopes are JSON-safe by
	// construction; parseRaw also reads legacy subtree records.
	dos().write(pathFor(shardName, parts), JSON.stringify(record), { rootKey: ROOT_KEY });
	scheduleShardMaintenance();
	return record;
}

function parseRaw(raw) {
	if (raw == null) return null;
	if (typeof raw !== 'string') return clone(raw);
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function readRecord(fullPath) {
	return parseRaw(dos().get(fullPath, { rootKey: ROOT_KEY }));
}

function get({ shard: shardName = 'core', parts = [] }) {
	return readRecord(pathFor(shardName, parts));
}

function list({ shard: shardName = 'core', predicate = null } = {}) {
	const output = [];
	// One sequential entries pass (per-key get re-scans the dictionary).
	for (const [, raw] of dos().entries(shardPath(shardName), { rootKey: ROOT_KEY })) {
		const record = parseRaw(raw);
		if (record && (!predicate || predicate(record))) output.push(record);
	}
	return output;
}

function remove({ shard: shardName = 'core', parts = [] }) {
	const result = dos().delete(pathFor(shardName, parts), { rootKey: ROOT_KEY });
	scheduleShardMaintenance();
	return result;
}

// B"H 2026-11-11 (json-migration M1 prep): batch write API. The engine
// already supports pager batching — AwtsmoosDB.batch(fn) sets
// pager.isBatching for the callback's duration and runs one
// waitForIdle() (durability + free-space pipeline) when the outermost
// batch ends (ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/database.js
// batch()). This store never used it, so bulk writers (the JSONL→vessel
// converter, any future batched mirror path) paid the full per-put
// pager path record by record. batch()/putMany()/removeMany() are thin
// wrappers: every record still goes through the exact put()/remove()
// code above, so record shape and semantics are unchanged — only the
// pager's flush cadence changes. TurboWriteBehind is deliberately NOT
// enabled here: it is opt-in via the constructor option `turboWrites`,
// which openDb() does not set, and flipping engine open options is a
// separate decision from adding a batch facade.
function batch(fn) {
	const db = openDb();
	if (db && typeof db.batch === 'function') return db.batch(fn);
	return fn();
}

function putMany(records = []) {
	if (!Array.isArray(records) || records.length === 0) return [];
	return batch(() => records.map(record => put(record)));
}

function removeMany(items = []) {
	if (!Array.isArray(items) || items.length === 0) return [];
	return batch(() => items.map(item => remove(item)));
}

// Keys-only census for one shard. DosDBBridge.list() returns child
// keys via db.keys() without materializing record bodies, while
// list() above parses every record — on the core shard that is the
// whole live set held in RAM. Falls back to list() if the bridge
// shape ever changes.
function count({ shard: shardName = 'core' } = {}) {
	try {
		return dos().list(shardPath(shardName), { rootKey: ROOT_KEY }).length;
	} catch (_error) {
		return list({ shard: shardName }).length;
	}
}

function info() {
	return { path: ROOT, engine: 'AwtsmoosDB', rootKey: ROOT_KEY, wal: true };
}

function close() {
	const timer = maintenanceTimers.get(ROOT);
	if (timer) { clearTimeout(timer); maintenanceTimers.delete(ROOT); }
	try { database?.close(); } catch {}
	database = null;
}

process.once('exit', close);

module.exports = { batch, close, count, decode, get, info, key, list, openDb, put, putMany, remove, removeMany, resolveEngine, scheduleShardMaintenance };
