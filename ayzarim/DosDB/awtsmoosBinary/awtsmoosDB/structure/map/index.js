// B"H
// Boruch Hashem
// Blessed is He

const MapNode = require("./node.js");
const Insertion = require("./ops/insertion.js");
const Deletion = require("./ops/deletion.js");
const promoteRoot = require("./rootPromotion.js");
const bulkLoadSorted = require("./bulkLoader.js");
const walk = require("./walker.js");
const SmartPointer = require("../../utils/smartPointer/index.js");
const constants = require("../../constants.js");

/**
 * @file Owns one sorted-map root and reports exact storage identity on failed root loads.
 * @description
 * The Awtsmoos gives the first empty root its form before any key is inscribed.
 * Awtsmoos.com reuses that exact in-memory root for first insertion, while an existing
 * unreadable root fails closed with bounded file/offset evidence for precise recovery.
 */
class MapEngine {
	constructor(allocator, pointer = null) {
		this.allocator = allocator;
		this.db = allocator.db;
		this.ptr = Buffer.isBuffer(pointer) ? SmartPointer.decode(pointer) : pointer;
		this.nodeIO = new MapNode(allocator);
		this.insertOps = new Insertion(this.nodeIO);
		this.deleteOps = new Deletion(this.nodeIO);
	}

	/** Creates and persists one empty leaf root, returning its stable pointer seal. */
	create() {
		const seal = this.nodeIO.save(emptyRoot());
		this.ptr = SmartPointer.decode(seal);
		return seal;
	}

	/** Returns the value pointer for one key, or null when the map has no root. */
	getPtr(key) {
		if (!this.ptr) return null;
		const MapSeeker = require("./seeker.js");
		return MapSeeker.get(this.db, this.ptr, key);
	}

	/** Inserts one key/value pointer and promotes the root when splitting requires it. */
	set(key, valuePointer) {
		const freshRoot = !this.ptr;
		if (freshRoot) this.create();
		const rootSeal = SmartPointer.encode(
			constants.VAL_TYPE.MAP,
			this.ptr.offset,
			this.ptr.length
		);
		const root = freshRoot ? emptyRoot() : this.nodeIO.load(this.ptr);
		if (!root) throw unreadableRootError(this.db, this.ptr, "insertion");
		const keyBuffer = Buffer.isBuffer(key)
			? key
			: Buffer.from(String(key), "utf8");
		const result = this.insertOps.perform(root, keyBuffer, valuePointer, rootSeal);
		const finalSeal = promoteRoot(this.nodeIO, result);
		this.ptr = SmartPointer.decode(finalSeal);
		// B"H §8.1: every node rewritten on the path retires its previous
		// seal. Free those ranges at write time instead of dropping them
		// for the complement refresh to rediscover. Freeing runs through
		// allocator.free(), so inside db.batch() the ranges wait in the
		// retirement queue and are promoted at the idle boundary; outside
		// a batch they join the free list (or the pending ledger when the
		// verified gate is closed). A seal identical to the live seal is
		// never freed. The one double-free overlap — the old root seal,
		// which the parent set also releases — can only meet inside
		// db.batch(), where the retirement queue coalesces duplicates
		// before any range is handed out again.
		this._releaseRetired(result.retiredSeals, finalSeal);
		if (this.db && this.db.allocator && typeof this.db.allocator.notifyRetired === 'function') {
			this.db.allocator.notifyRetired();
		}
		return finalSeal;
	}

	/** Frees retired node seals, skipping any seal that is still live. */
	_releaseRetired(seals, liveSeal) {
		if (!seals || !seals.length || !this.allocator) return;
		let live = null;
		try { live = liveSeal ? SmartPointer.decode(liveSeal) : null; } catch (_err) { live = null; }
		for (const seal of seals) {
			if (!seal) continue;
			try {
				const decoded = SmartPointer.decode(seal);
				if (!decoded) continue;
				if (live && decoded.offset === live.offset && decoded.length === live.length) continue;
				this.allocator.releasePointer(seal);
			} catch (_err) {
				// A malformed retired seal must never break the write.
			}
		}
	}

	/** Bulk-loads already sorted entries using the dedicated balanced-map loader. */
	bulkLoadSorted(entries, options = {}) {
		return bulkLoadSorted(this, entries, options);
	}

	/** Deletes one key and adopts the replacement root returned by the deletion engine. */
	delete(key) {
		if (!this.ptr) return false;
		const rootSeal = SmartPointer.encode(
			constants.VAL_TYPE.MAP,
			this.ptr.offset,
			this.ptr.length
		);
		const root = this.nodeIO.load(this.ptr);
		if (!root) throw unreadableRootError(this.db, this.ptr, "deletion");
		const result = this.deleteOps.perform(root, Buffer.from(String(key), "utf8"), rootSeal);
		if (!result.success) return false;
		this.ptr = SmartPointer.decode(result.newSeal);
		// B"H §8.1: same write-time retirement as set() — see there.
		this._releaseRetired(result.retiredSeals, result.newSeal);
		if (this.db && this.db.allocator && typeof this.db.allocator.notifyRetired === 'function') {
			this.db.allocator.notifyRetired();
		}
		return true;
	}

	/** Streams entries in key order between the optional range boundaries. */
	*range(start, end) {
		if (!this.ptr) return;
		const root = this.nodeIO.load(this.ptr);
		if (!root) throw unreadableRootError(this.db, this.ptr, "range");
		yield* walk(this.nodeIO, root, start, end);
	}
}

/** Returns one pristine mutable root object for a newly created empty map. */
function emptyRoot() {
	return { isLeaf: true, keys: [], values: [] };
}

/** Builds a fail-closed error containing only bounded storage identity, never user values. */
function unreadableRootError(database = {}, pointer = {}, operation = "access") {
	const file = String(database.pager?.filePath || "unknown").slice(-320);
	const offset = Number(pointer.offset || 0);
	const length = Number(pointer.length || 0);
	const error = new Error(`B"H map ${operation} could not load existing root file=${file} offset=${offset} length=${length}`);
	error.code = "AWTSMOOSDB_MAP_ROOT_UNREADABLE";
	return error;
}

module.exports = MapEngine;
