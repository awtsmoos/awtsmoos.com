// B"H

/**
 * @file structure/map/index.js
 * @chapter The Sorted Mountain Promotes Every Shattered Root
 * @description Coordinates map creation, insertion, root promotion, deletion, bulk loading, and traversal.
 */

const MapNode = require('./node.js');
const Insertion = require('./ops/insertion.js');
const Deletion = require('./ops/deletion.js');
const promoteRoot = require('./rootPromotion.js');
const bulkLoadSorted = require('./bulkLoader.js');
const walk = require('./walker.js');
const SmartPointer = require('../../utils/smartPointer/index.js');
const constants = require('../../constants.js');

class MapEngine {
	constructor(allocator, pointer = null) {
		this.allocator = allocator;
		this.db = allocator.db;
		this.ptr = Buffer.isBuffer(pointer) ? SmartPointer.decode(pointer) : pointer;
		this.nodeIO = new MapNode(allocator);
		this.insertOps = new Insertion(this.nodeIO);
		this.deleteOps = new Deletion(this.nodeIO);
	}

	create() {
		const seal = this.nodeIO.save({ isLeaf: true, keys: [], values: [] });
		this.ptr = SmartPointer.decode(seal);
		return seal;
	}

	getPtr(key) {
		if (!this.ptr) return null;
		const MapSeeker = require('./seeker.js');
		return MapSeeker.get(this.db, this.ptr, key);
	}

	set(key, valuePointer) {
		if (!this.ptr) this.create();
		const rootSeal = SmartPointer.encode(constants.VAL_TYPE.MAP, this.ptr.offset, this.ptr.length);
		const root = this.nodeIO.load(this.ptr);
		if (!root) throw new Error('B"H map insertion could not load its root');
		const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
		const result = this.insertOps.perform(root, keyBuffer, valuePointer, rootSeal);
		const finalSeal = promoteRoot(this.nodeIO, result);
		this.ptr = SmartPointer.decode(finalSeal);
		return finalSeal;
	}

	bulkLoadSorted(entries, options = {}) {
		return bulkLoadSorted(this, entries, options);
	}

	delete(key) {
		if (!this.ptr) return false;
		const root = this.nodeIO.load(this.ptr);
		const result = this.deleteOps.perform(root, Buffer.from(String(key), 'utf8'));
		if (!result.success) return false;
		this.ptr = SmartPointer.decode(result.newSeal);
		return true;
	}

	*range(start, end) {
		if (!this.ptr) return;
		yield* walk(this.nodeIO, this.nodeIO.load(this.ptr), start, end);
	}
}

module.exports = MapEngine;
