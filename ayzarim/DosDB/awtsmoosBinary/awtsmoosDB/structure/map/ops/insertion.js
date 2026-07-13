// B"H

/**
 * @file structure/map/ops/insertion.js
 * @chapter Every Rewritten Branch Names The Former Vessel It Replaces
 * @description Inserts recursively, returns split metadata, and records retired node seals.
 */

const Search = require('./search.js');
const SplitOps = require('./split.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

class MapInsertion {
	constructor(nodeIO) {
		this.nodeIO = nodeIO;
		this.splitLogic = new SplitOps(nodeIO);
	}

	perform(node, keyBuffer, valuePointer, currentSeal) {
		const search = Search.findKey(node, keyBuffer);
		if (node.isLeaf) {
			this.writeLeaf(node, search, keyBuffer, valuePointer);
			return this.saveChangedNode(node, currentSeal);
		}
		return this.writeBranch(node, search, keyBuffer, valuePointer, currentSeal);
	}

	writeLeaf(node, search, keyBuffer, valuePointer) {
		if (search.found) {
			node.values[search.index] = valuePointer;
			return;
		}
		node.keys.splice(search.index, 0, keyBuffer);
		node.values.splice(search.index, 0, valuePointer);
	}

	writeBranch(node, search, keyBuffer, valuePointer, currentSeal) {
		let childIndex = search.found ? search.index + 1 : search.index;
		if (childIndex >= node.children.length) childIndex = node.children.length - 1;
		const childSeal = node.children[childIndex];
		const childNode = this.nodeIO.load(SmartPointer.decode(childSeal));
		if (!childNode) throw new Error('B"H map insertion could not load a child node');
		const childResult = this.perform(childNode, keyBuffer, valuePointer, childSeal);
		node.children[childIndex] = childResult.newSeal;
		if (childResult.split) this.absorbSplit(node, childIndex, childResult.split);
		const result = this.saveChangedNode(node, currentSeal);
		result.retiredSeals.push(...childResult.retiredSeals);
		return result;
	}

	absorbSplit(node, childIndex, split) {
		node.keys.splice(childIndex, 0, split.key);
		node.children.splice(childIndex + 1, 0, split.siblingSeal);
	}

	saveChangedNode(node, currentSeal) {
		const split = this.splitLogic.check(node);
		return {
			split,
			newSeal: split ? split.nodeSeal : this.nodeIO.save(node),
			retiredSeals: currentSeal ? [Buffer.from(currentSeal)] : []
		};
	}
}

module.exports = MapInsertion;
