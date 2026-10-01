// B"H
'use strict';

const utils = require('./utils.js');

const MAX_ITEMS = 200;

/**
 * @file append.js
 * @description
 * The right edge of the sequence grows without swallowing its sibling. When a
 * full internal vessel receives a child split, the new child is carried into a
 * new sibling instead of disappearing. Thus the Awtsmoos preserves every item.
 */
class AppendOps {
	constructor(sequence) {
		this.seq = sequence;
		this.nodeIO = sequence.nodeIO;
	}

	append(itemPointer) {
		let root = this.nodeIO.load(this.seq.ptr);
		if (!root) {
			root = this.nodeIO.create(true);
			this.seq.ptr = this.nodeIO.save(root);
		}
		const result = this._appendRecursive(root, itemPointer);
		if (result.splitNode) {
			utils.handleRootSplit(this.nodeIO, this.seq, root, [result.splitNode]);
			return { newPtr: this.seq.ptr };
		}
		return { newPtr: result.newPtr || this.seq.ptr };
	}

	_recount(node) {
		node.totalCount = 0;
		node.totalBytes = 0;
		for (const item of node.items) {
			node.totalCount += item.count;
			node.totalBytes += utils.getPtrSize(item.ptr);
		}
	}

	_newLeaf(itemPointer, itemSize, weak) {
		const sibling = this.nodeIO.create(true, weak);
		sibling.items.push({ ptr: itemPointer, count: 1 });
		sibling.totalCount = 1;
		sibling.totalBytes = itemSize;
		this.nodeIO.save(sibling);
		return sibling;
	}

	_splitInternal(node, pendingSibling) {
		const sibling = this.nodeIO.create(false, node.isWeak);
		const half = Math.ceil(node.items.length / 2);
		sibling.items = node.items.splice(half);
		sibling.items.push({
			ptr: utils.encodePtr(pendingSibling.ptr),
			count: pendingSibling.totalCount
		});
		this._recount(sibling);
		this.nodeIO.save(sibling);
		this._recount(node);
		const pointer = this.nodeIO.save(node);
		return { splitNode: sibling, newPtr: pointer };
	}

	_appendRecursive(node, itemPointer) {
		const itemSize = utils.getPtrSize(itemPointer);
		if (node.isLeaf) {
			if (node.items.length >= MAX_ITEMS) {
				return { splitNode: this._newLeaf(itemPointer, itemSize, node.isWeak) };
			}
			node.items.push({ ptr: itemPointer, count: 1 });
			this._recount(node);
			return { splitNode: null, newPtr: this.nodeIO.save(node) };
		}
		const childRef = node.items[node.items.length - 1];
		const childNode = this.nodeIO.load(utils.decodePtr(childRef.ptr));
		const result = this._appendRecursive(childNode, itemPointer);
		if (result.newPtr) childRef.ptr = utils.encodePtr(result.newPtr);
		childRef.count = childNode.totalCount;
		if (result.splitNode) {
			if (node.items.length >= MAX_ITEMS) return this._splitInternal(node, result.splitNode);
			node.items.push({ ptr: utils.encodePtr(result.splitNode.ptr), count: result.splitNode.totalCount });
		}
		this._recount(node);
		return { splitNode: null, newPtr: this.nodeIO.save(node) };
	}
}

module.exports = AppendOps;
