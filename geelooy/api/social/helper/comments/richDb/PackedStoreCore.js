//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedStoreCore
 * @description State owner for the packed store cache; open/read/write/remove (split from PackedStore.js, verbatim).
 *
 * Flush coalescing (write-path patch P3): write()/remove() used to call
 * db.fs.flush() after EVERY operation, so one comment create paid ~6
 * synchronous flush cycles (each ~3 fsyncs + ftruncate on a multi-GiB
 * file) inside a single request. batch($i, fn) defers the flush to the
 * outermost batch commit — the same budget idea as DosDB's
 * durableFlush.js, at request scope instead of a time/write budget:
 * inside a batch, writes only mark the store dirty; exactly one flush
 * runs when the outermost batch ends. Nested batches never flush.
 * A batch is NOT a transaction: there is no rollback, writes apply
 * immediately and reads inside the batch see them; if fn throws, the
 * writes already applied are still flushed once (they already happened)
 * and the error propagates. Outside any batch, behaviour is unchanged:
 * every write/remove flushes immediately.
 *
 * Multi-set primitive (db-phase2 integration): writeMany($i, entries)
 * applies a group of [target, value] sets through the FS3 layer's own
 * db.fs.writeMany — one db.batch(), one free-list seal save, and one
 * durable flush for the whole group, with all-or-nothing visibility at
 * the manifest level (see awtsmoosDB/api/fs/v3/writeMany.js for the full
 * contract). This is the vehicle the createComment flush map (comments
 * pack NOTES §7) calls for: the per-set seal saves inside each write —
 * the dominant cost on large stores — collapse along with the flushes,
 * which the P3 batch alone cannot reach. Inside an open P3 batch,
 * writeMany defers to the batch instead: sets apply through write() and
 * the outermost batch commit owns the single flush.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

	const { FILE, MAX_IMPLICIT_STORE_BYTES, legacyMigrationAllowed, refuseOversizedImplicitStore, refuseImplicitLegacyMigration } = require("./PackedStoreGuard.js");

const cache = new Map();

function dbRoot($i) {
	return $i?.db?.directory || $i?.db?.root || process.cwd();
}

function dbFile($i) {
	return path.join(dbRoot($i), 'socialPacked', FILE);
}

function fingerprint(file) {
	if (!fs.existsSync(file)) return 'missing';
	const status = fs.statSync(file);
	return `${status.dev}:${status.ino}`;
}

function open($i, opts = {}) {
	const file = dbFile($i);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	refuseOversizedImplicitStore(file, opts);
	const mark = fingerprint(file);
	const current = cache.get(file);
	if (current?.mark === mark) return current.db;
	try { current?.db?.close(); } catch {}
	const db = new AwtsmoosDB(file, {
		debug: false,
		readOnly: false,
		reuseFreedSpace: 'verified',
		versions: false,
		virtualFsCompression: true,
		// B"H §8.5: WAL on (engine default) — see openHeichelFsDb.
		processLockMode: 'exclusive',
		lockMode: 'exclusive'
	});
	db.open();
	try {
		refuseImplicitLegacyMigration(db, file);
	} catch (error) {
		try { db.close(); } catch {}
		throw error;
	}
	cache.set(file, { db, mark: fingerprint(file) });
	return db;
}

// Per-file batch state: { depth, dirty }. Keyed by the resolved store
// file so every caller sharing a store (richCommentAccess delegates here)
// shares one batch scope for that store.
const batchStateByFile = new Map();

function batchState(file) {
	let state = batchStateByFile.get(file);
	if (!state) {
		state = { depth: 0, dirty: false };
		batchStateByFile.set(file, state);
	}
	return state;
}

// Flush now unless a batch is open for this file, in which case the
// outermost batch commit performs the single flush.
function requestFlush($i, db) {
	const state = batchState(dbFile($i));
	if (state.depth > 0) {
		state.dirty = true;
		return false;
	}
	db.fs.flush?.();
	return true;
}

function beginBatch($i) {
	const state = batchState(dbFile($i));
	state.depth++;
	return state.depth;
}

function endBatch($i) {
	const file = dbFile($i);
	const state = batchState(file);
	if (state.depth > 0) state.depth--;
	if (state.depth === 0 && state.dirty) {
		state.dirty = false;
		// Resolve the open handle without re-running the open guards for a
		// flush-only commit; if the store was never opened there is by
		// construction nothing dirty to flush.
		const current = cache.get(file);
		if (current?.db) current.db.fs.flush?.();
	}
	return state.depth;
}

// Run fn (sync or async) inside one batch for this store: all write()/
// remove() flushes are deferred and coalesced into a single flush when
// the outermost batch ends — including when fn throws (applied writes
// are not rolled back; see the module note). Always await the result:
//   await store.batch($i, async () => { ...writes... });
async function batch($i, fn) {
	beginBatch($i);
	try {
		return await fn();
	} finally {
		endBatch($i);
	}
}

function read($i, target, fallback = null) {
	const db = open($i);
	const status = db.fs.stat(target);
	if (!status?.exists || status.type !== 'file') return fallback;
	return awts.deserializeBinary(db.fs.readRange(target, 0, status.size));
}

function serializeValue(value) {
	return Array.isArray(value)
		? awts.serializeArray(value)
		: awts.serializeJSON(value ?? {});
}

function write($i, target, value) {
	const db = open($i);
	db.fs.write(target, serializeValue(value));
	requestFlush($i, db);
	return value;
}

// Applies a group of [target, value] sets as ONE FS3 batch (see the
// module note): one manifest commit, one seal save, one durable flush.
// Values are serialized exactly as write() serializes them. Returns the
// values in entry order. If an entry throws, the error propagates and
// no flush is performed by this call (the db.fs.writeMany contract).
function writeMany($i, entries) {
	const list = Array.isArray(entries) ? entries : [];
	if (!list.length) return [];
	if (batchState(dbFile($i)).depth > 0) {
		// A P3 batch is open for this store: apply through write() so the
		// batch's outermost commit performs the single flush.
		return list.map(([target, value]) => write($i, target, value));
	}
	const db = open($i);
	if (typeof db.fs.writeMany === 'function') {
		db.fs.writeMany(list.map(([target, value]) => [target, serializeValue(value)]));
	} else {
		// Older FS layer without the multi-set primitive: same grouping,
		// one explicit flush at the end.
		for (const [target, value] of list) db.fs.write(target, serializeValue(value));
		db.fs.flush?.();
	}
	return list.map(([, value]) => value);
}

function remove($i, target) {
	const db = open($i);
	const status = db.fs.stat(target);
	if (!status?.exists) return false;
	const result = db.fs.rm(target, { recursive: true });
	requestFlush($i, db);
	return result;
}

function closeAll() {
	for (const entry of cache.values()) try { entry.db.close(); } catch {}
	cache.clear();
}

module.exports = {
	cache,
	dbRoot,
	dbFile,
	fingerprint,
	open,
	read,
	write,
	writeMany,
	remove,
	closeAll,
	batch,
	beginBatch,
	endBatch,
};
process.once('exit', closeAll);
