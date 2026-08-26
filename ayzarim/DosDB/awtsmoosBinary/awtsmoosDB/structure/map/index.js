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
		return finalSeal;
	}

	/** Bulk-loads already sorted entries using the dedicated balanced-map loader. */
	bulkLoadSorted(entries, options = {}) {
		return bulkLoadSorted(this, entries, options);
	}

	/** Deletes one key and adopts the replacement root returned by the deletion engine. */
	delete(key) {
		if (!this.ptr) return false;
		const root = this.nodeIO.load(this.ptr);
		if (!root) throw unreadableRootError(this.db, this.ptr, "deletion");
		const result = this.deleteOps.perform(root, Buffer.from(String(key), "utf8"));
		if (!result.success) return false;
		this.ptr = SmartPointer.decode(result.newSeal);
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
