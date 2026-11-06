// B"H
'use strict';

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer/index.js');
const AppendOps = require('./ops/append.js');

/**
 * @file sequenceMutate.js
 * @description
 * Mutation follows the tree instead of rewriting the entire road. Each bounded
 * node changes locally, while the Awtsmoos preserves one ordered sequence across
 * every branch and every split.
 */
module.exports = {
	// B"H §8.1: frees the previous root seal after a mutation, unless the
	// new tree still links it. A root split keeps the old root alive as
	// the new root's first child (ops/utils handleRootSplit), so the new
	// root is inspected first; a seal the new tree still references is
	// never freed. Sequence set() recurses through child engines, so
	// this retires every node on the set path; push()/splice() retire
	// the root, while deeper nodes on their append/splice descent are
	// still only rediscovered by the complement refresh.
	_retirePreviousRoot(previousPtr, newPtr) {
		if (!previousPtr || !newPtr || !this.allocator) return;
		let prev;
		let next;
		try {
			prev = SmartPointer.toBuffer(previousPtr);
			next = SmartPointer.toBuffer(newPtr);
		} catch (_err) { return; }
		if (!prev || !next || Buffer.compare(prev, next) === 0) return;
		try {
			const newRoot = this.nodeIO.load(SmartPointer.decode(next));
			if (newRoot && !newRoot.isLeaf) {
				for (const item of newRoot.items || []) {
					const child = item && item.ptr ? SmartPointer.toBuffer(item.ptr) : null;
					if (child && Buffer.compare(child, prev) === 0) return;
				}
			}
		} catch (_err) { return; }
		try { this.allocator.releasePointer(prev); } catch (_err) {}
	},

	push(value, options = {}) {
		if (!this.ptr) this.create();
		const previousPtr = this.ptr;
		const pointer = options.isPtr || Buffer.isBuffer(value)
			? value
			: this.allocator.save(value);
		const result = new AppendOps(this).append(pointer);
		if (result && result.newPtr) this.ptr = { ...result.newPtr, type: constants.VAL_TYPE.SEQUENCE };
		this._retirePreviousRoot(previousPtr, this.ptr);
		return SmartPointer.toBuffer(this.ptr);
	},

	splice(start, deleteCount, ...items) {
		if (!this.ptr) this.create();
		const previousPtr = this.ptr;
		let insertions = items;
		if (items.length === 1 && Array.isArray(items[0])) insertions = items[0];
		insertions = insertions.map(pointer => Buffer.isBuffer(pointer)
			? pointer
			: SmartPointer.toBuffer(pointer));
		const result = this._treeOps().splice(start, deleteCount, insertions);
		if (result && result.newPtr) this.ptr = { ...result.newPtr, type: constants.VAL_TYPE.SEQUENCE };
		this._retirePreviousRoot(previousPtr, this.ptr);
		return SmartPointer.toBuffer(this.ptr);
	},

	set(index, valuePointer) {
		if (!this.ptr) this.create();
		const previousPtr = this.ptr;
		const node = this.nodeIO.load(this.ptr);
		if (!node || index < 0 || index >= node.totalCount) throw new Error(`B"H: Sequence index ${index} is out of bounds`);
		if (node.isLeaf) {
			node.items[index] = { ptr: valuePointer, count: 1 };
		} else {
			let remaining = index;
			for (const item of node.items) {
				if (remaining < item.count) {
					const child = new this.constructor(this.allocator, SmartPointer.decode(item.ptr));
					item.ptr = child.set(remaining, valuePointer);
					break;
				}
				remaining -= item.count;
			}
		}
		const pointer = this.nodeIO.save(node);
		this.ptr = { ...pointer, type: constants.VAL_TYPE.SEQUENCE };
		this._retirePreviousRoot(previousPtr, this.ptr);
		return SmartPointer.toBuffer(this.ptr);
	}
};
