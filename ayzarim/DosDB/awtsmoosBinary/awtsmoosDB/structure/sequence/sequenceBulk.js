// B"H
'use strict';

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer/index.js');

const MAX_NODE_ITEMS = 200;

/**
 * @file sequenceBulk.js
 * @description
 * No leaf is asked to contain the whole world. The Awtsmoos reveals order
 * through bounded branches, so even seventy thousand entries remain a tree of
 * small vessels and never approach the UInt16 node-count horizon.
 */
function saveLevel(engine, items, isLeaf) {
	const next = [];
	for (let index = 0; index < items.length; index += MAX_NODE_ITEMS) {
		const chunk = items.slice(index, index + MAX_NODE_ITEMS);
		const node = engine.nodeIO.create(isLeaf);
		node.items = isLeaf
			? chunk.map(pointer => ({ ptr: pointer, count: 1 }))
			: chunk.map(child => ({ ptr: SmartPointer.toBuffer(child.ptr), count: child.count }));
		node.totalCount = chunk.reduce(
			(sum, item) => sum + (isLeaf ? 1 : item.count),
			0
		);
		const pointer = engine.nodeIO.save(node);
		next.push({ ptr: pointer, count: node.totalCount });
	}
	return next;
}

module.exports = {
	bulkLoadPointers(values) {
		const pointers = Array.from(values || []).map(value =>
			Buffer.isBuffer(value) ? value : SmartPointer.toBuffer(value)
		);
		let level = saveLevel(this, pointers, true);
		if (!level.length) {
			const leaf = this.nodeIO.create(true);
			const pointer = this.nodeIO.save(leaf);
			this.ptr = { ...pointer, type: constants.VAL_TYPE.SEQUENCE };
			return SmartPointer.toBuffer(this.ptr);
		}
		while (level.length > 1) level = saveLevel(this, level, false);
		this.ptr = { ...level[0].ptr, type: constants.VAL_TYPE.SEQUENCE };
		return SmartPointer.toBuffer(this.ptr);
	}
};
