// B"H
'use strict';

const SequenceNode = require('./node.js');
const SmartPointer = require('../../utils/smartPointer/index.js');
const sequenceCore = require('./sequenceCore.js');
const sequenceRead = require('./sequenceRead.js');
const sequenceBulk = require('./sequenceBulk.js');
const sequenceMutate = require('./sequenceMutate.js');

/**
 * @file sequence/index.js
 * @description
 * One small doorway reveals a bounded B-tree. The Awtsmoos does not require a
 * giant root to preserve one order; creation, reading, bulk building, and
 * mutation remain separate vessels composed into the familiar engine surface.
 */
class SequenceEngine {
	constructor(allocator, pointer = null) {
		this.allocator = allocator;
		this.db = allocator.db;
		this.ptr = Buffer.isBuffer(pointer) ? SmartPointer.decode(pointer) : pointer;
		this.nodeIO = new SequenceNode(this.allocator, this);
		this.ops = null;
	}
}

Object.assign(
	SequenceEngine.prototype,
	sequenceCore,
	sequenceRead,
	sequenceBulk,
	sequenceMutate
);

module.exports = SequenceEngine;
