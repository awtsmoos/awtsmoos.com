// B"H
/**
 * @file writeMany.js
 * @chapter Many Sets, One Manifest, One Durable Boundary
 * @description
 * Multi-set primitive for VirtualFs v3 (db-phase2, audit section 5.2.1).
 *
 * Why this exists: a bare `db.fs.write()` outside any batch pays the
 * allocator's free-list seal save synchronously on EVERY allocate/free
 * (freeListPersistence.schedule() flushes immediately when the pager is
 * not batching). Measured on the seeded bench store, one overwrite cost
 * ~55 ms median with 2 seal saves per write, and one PackedStoreCore
 * comment create (~6 sets across two stores) cost ~1,085 ms in the
 * original baseline. Deferring only `db.fs.flush()` bought ~1.4x,
 * because the per-set seal saves still fired inside each write.
 *
 * writeMany applies N sets under ONE `db.batch()`:
 *   - every allocate/free inside the batch only MARKS the free list
 *     dirty (schedule() defers while pager.isBatching), so the whole
 *     batch pays ONE free-list seal save at the idle boundary;
 *   - all FS3 manifest records (inodes, child maps, meta) accumulate in
 *     the write-behind session and persist through ONE storeState
 *     flush: one root-commit batch + one durable boundary;
 *   - the batch's idle boundary performs the usual order: retired-range
 *     promotion, verified-complement refresh, seal save, superblock,
 *     fsync — exactly the durability sequence a single flushed write
 *     already relies on, paid once instead of once per set.
 *
 * Durability / atomicity contract:
 *   - With { flush: true } (default), when writeMany returns, every set
 *     in the batch is durable and visible; the manifest records were
 *     committed by a single storeState flush inside the batch, so a
 *     crash before that flush leaves NONE of the batch's sets in the
 *     durable manifest (all-or-nothing at the manifest level). Blob
 *     bodies allocated by an interrupted batch may remain as orphaned
 *     bytes; they are unreachable and are reclaimed by the ordinary
 *     gc / verified-complement machinery, never misread as data.
 *   - If an entry throws (e.g. IS_DIRECTORY), the error propagates,
 *     later entries are not attempted, and NO flush is performed by
 *     writeMany. Sets already applied remain in the in-memory
 *     write-behind session (identical semantics to db.batch and to a
 *     throwing single write today): they become durable only if a
 *     later flush/close persists the session. Callers that need
 *     rollback must discard the handle; writeMany does not fake it.
 *   - With { flush: false }, sets join the write-behind session with
 *     exactly the durability of a bare write() (next flush/close).
 *
 * The durableFlush contract used by DosDB routed shards (25 writes /
 * 250 ms) is unchanged: writeMany is the synchronous-commit counterpart
 * for callers that already hold a complete set group (comment create:
 * record + URL pointer + 3 index updates in the main store).
 */

const paths = require("./path");
const store = require("./store");
const { withFsTx } = require("./transactions");
const { writeSync } = require("./write");

/**
 * Normalizes the accepted entry shapes into [{ path, value }].
 * Accepts: Array<[path, value]>, Array<{ path, value }>, Map, or a
 * plain object mapping path -> value.
 * @param {*} entries - Entry collection.
 * @returns {Array<{path: string, value: *}>} Normalized entries.
 */
function normalizeEntries(entries) {
	if (!entries) return [];
	if (entries instanceof Map) {
		return [...entries.entries()].map(([path, value]) => ({ path, value }));
	}
	if (Array.isArray(entries)) {
		return entries.map(entry => {
			if (Array.isArray(entry)) return { path: entry[0], value: entry[1] };
			if (entry && typeof entry === "object" && "path" in entry) {
				return { path: entry.path, value: entry.value };
			}
			throw new Error('B"H writeMany entries must be [path, value] pairs or { path, value } objects');
		});
	}
	if (typeof entries === "object") {
		return Object.entries(entries).map(([path, value]) => ({ path, value }));
	}
	throw new Error('B"H writeMany entries must be an array, a Map, or a plain object');
}

/**
 * Applies many file sets as one batch: one manifest update pass, one
 * free-list seal save, one durable boundary (when flushing).
 * @param {object} fs - VirtualFs instance.
 * @param {*} entries - See normalizeEntries for accepted shapes.
 * @param {object} [options] - { flush = true }.
 * @returns {Array<boolean>} One true per applied set, in entry order.
 */
function writeMany(fs, entries, options = {}) {
	const list = normalizeEntries(entries);
	const shouldFlush = !options || options.flush !== false;
	const results = [];
	if (!list.length) return results;
	fs.db.batch(() => {
		withFsTx(fs.db, `writeMany:${list.length}`, () => {
			for (const entry of list) {
				writeSync(fs, paths.normalize(fs.cwd, entry.path), entry.value);
				results.push(true);
			}
		});
		if (shouldFlush) store.flush(fs.db);
	});
	return results;
}

module.exports = { writeMany, normalizeEntries };
