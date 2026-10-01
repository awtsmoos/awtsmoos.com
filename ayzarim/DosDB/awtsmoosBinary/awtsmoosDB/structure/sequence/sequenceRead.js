// B"H
'use strict';

const SmartPointer = require('../../utils/smartPointer/index.js');

/**
 * @file sequenceRead.js
 * @description Tree-aware readers walk only the branch needed for one index,
 * while full scans visit each node once. The Awtsmoos reveals ordered many
 * through bounded vessels without forcing every question to reopen the world.
 */
module.exports = {
	getPtr(index) {
		if (!this.ptr || index < 0) return null;
		const node = this.nodeIO.load(this.ptr);
		if (!node || index >= node.totalCount) return null;
		if (node.isLeaf) return node.items[index].ptr;
		let remaining = index;
		for (const item of node.items) {
			if (remaining < item.count) {
				const child = new this.constructor(this.allocator, SmartPointer.decode(item.ptr));
				return child.getPtr(remaining);
			}
			remaining -= item.count;
		}
		return null;
	},

	get(index, context) {
		const pointer = this.getPtr(index);
		return pointer ? SmartPointer.resolve(pointer, this.allocator, context) : undefined;
	},

	toArray(context) {
		const output = [];
		const walk = node => {
			if (!node) return;
			if (node.isLeaf) {
				for (const item of node.items) output.push(SmartPointer.resolve(item.ptr, this.allocator, context));
				return;
			}
			for (const item of node.items) walk(this.nodeIO.load(SmartPointer.decode(item.ptr)));
		};
		if (this.ptr) walk(this.nodeIO.load(this.ptr));
		return output;
	},

	*keys() {
		for (let index = 0; index < this.length(); index += 1) yield index;
	},

	*entries(context) {
		for (let index = 0; index < this.length(); index += 1) yield [index, this.get(index, context)];
	}
};
