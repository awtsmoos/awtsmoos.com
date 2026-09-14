//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file structure/map/streamingBulkBuilder.js
 * @module StreamingMapBulkBuilder
 * @description
 * Builds the ordinary persisted Awtsmoos B-tree from a sorted stream without
 * retaining the corpus. Only bounded leaf/branch descriptors remain in RAM;
 * every completed node is written once at its exact encoded byte length.
 */
const SmartPointer = require('../../utils/smartPointer/index.js');
const MapNode = require('./node.js');
/** Converts one caller key into the binary ordering used by persisted maps. */
function keyBytes(key) {
	return Buffer.isBuffer(key) ? Buffer.from(key) : Buffer.from(String(key), 'utf8');
}

/** Produces one balanced group split without leaving a one-child tail node. */
function groups(items, maximum) {
	if (items.length <= maximum) return [items];
	const leftSize = Math.ceil(items.length / 2);
	return [items.slice(0, leftSize), items.slice(leftSize)];
}
/**
 * Incrementally writes one sorted map using O(tree-height) bounded memory.
 */
class StreamingMapBulkBuilder {
	constructor(allocator, options = {}) {
		this.allocator = allocator;
		this.nodeIO = new MapNode(allocator);
		this.maxKeys = Math.max(8, Number(options.maxKeys || 200));
		this.maxChildren = this.maxKeys + 1;
		this.leaf = [];
		this.levels = [];
		this.lastKey = null;
		this.count = 0;
	}

	/** Adds one strictly increasing key and an already-built value pointer. */
	append(key, value) {
		const encodedKey = keyBytes(key);
		if (this.lastKey && encodedKey.compare(this.lastKey) <= 0) {
			throw new Error('B"H streaming map keys must be strictly increasing');
		}
		this.lastKey = encodedKey;
		this.leaf.push({ key: encodedKey, value: SmartPointer.toBuffer(value) });
		this.count += 1;
		if (this.leaf.length >= this.maxKeys) this.flushLeaf();
	}

	/** Writes the current leaf exactly once and promotes its descriptor. */
	flushLeaf() {
		if (!this.leaf.length) return;
		const entries = this.leaf;
		this.leaf = [];
		const seal = this.nodeIO.save({
			isLeaf: true,
			keys: entries.map(entry => entry.key),
			values: entries.map(entry => entry.value)
		});
		this.pushDescriptor(0, { firstKey: entries[0].key, seal });
	}

	/** Buffers a descriptor and flushes one full group while retaining a tail. */
	pushDescriptor(level, descriptor) {
		if (!this.levels[level]) this.levels[level] = [];
		const buffer = this.levels[level];
		buffer.push(descriptor);
		if (buffer.length < this.maxChildren * 2) return;
		const children = buffer.splice(0, this.maxChildren);
		this.pushDescriptor(level + 1, this.writeBranch(children));
	}

	/** Writes one internal B-tree node in the same format as bulkLoadSorted(). */
	writeBranch(children) {
		const seal = this.nodeIO.save({
			isLeaf: false,
			keys: children.slice(1).map(child => child.firstKey),
			children: children.map(child => child.seal)
		});
		return { firstKey: children[0].firstKey, seal };
	}

	/** Finalizes all bounded tails and returns the canonical map root seal. */
	finish() {
		this.flushLeaf();
		if (!this.count) {
			return this.nodeIO.save({ isLeaf: true, keys: [], values: [] });
		}
		let level = 0;
		while (true) {
			const current = this.levels[level] || [];
			const higher = this.levels[level + 1] || [];
			if (current.length === 1 && higher.length === 0 && this.noHigher(level + 2)) {
				return current[0].seal;
			}
			if (current.length) {
				this.levels[level] = [];
				for (const group of groups(current, this.maxChildren)) {
					this.pushDescriptor(level + 1, this.writeBranch(group));
				}
			}
			level += 1;
			if (level > 64) throw new Error('B"H streaming map exceeded sane tree height');
		}
	}

	/** Returns true only when no descriptor exists at or above the given level. */
	noHigher(start) {
		for (let level = start; level < this.levels.length; level += 1) {
			if (this.levels[level]?.length) return false;
		}
		return true;
	}
}

module.exports = StreamingMapBulkBuilder;
