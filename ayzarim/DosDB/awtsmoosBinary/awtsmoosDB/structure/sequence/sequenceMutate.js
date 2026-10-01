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
	push(value, options = {}) {
		if (!this.ptr) this.create();
		const pointer = options.isPtr || Buffer.isBuffer(value)
			? value
			: this.allocator.save(value);
		const result = new AppendOps(this).append(pointer);
		if (result && result.newPtr) this.ptr = { ...result.newPtr, type: constants.VAL_TYPE.SEQUENCE };
		return SmartPointer.toBuffer(this.ptr);
	},

	splice(start, deleteCount, ...items) {
		if (!this.ptr) this.create();
		let insertions = items;
		if (items.length === 1 && Array.isArray(items[0])) insertions = items[0];
		insertions = insertions.map(pointer => Buffer.isBuffer(pointer)
			? pointer
			: SmartPointer.toBuffer(pointer));
		const result = this._treeOps().splice(start, deleteCount, insertions);
		if (result && result.newPtr) this.ptr = { ...result.newPtr, type: constants.VAL_TYPE.SEQUENCE };
		return SmartPointer.toBuffer(this.ptr);
	},

	set(index, valuePointer) {
		if (!this.ptr) this.create();
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
		return SmartPointer.toBuffer(this.ptr);
	}
};
