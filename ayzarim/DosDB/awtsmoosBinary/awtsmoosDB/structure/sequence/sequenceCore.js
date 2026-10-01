// B"H
'use strict';

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer/index.js');

/**
 * @file sequenceCore.js
 * @description
 * The sequence has one visible seal while its inner tree may branch into many
 * bounded vessels. The Awtsmoos holds the many without surrendering the one;
 * this module keeps creation, length, and tree-operation identity equally small.
 */
module.exports = {
	_treeOps() {
		if (!this.ops) {
			const SequenceOps = require('./ops/index.js');
			this.ops = new SequenceOps(this);
		}
		return this.ops;
	},

	create() {
		const root = this.nodeIO.create(true);
		const pointer = this.nodeIO.save(root);
		this.ptr = { ...pointer, type: constants.VAL_TYPE.SEQUENCE };
		return SmartPointer.toBuffer(this.ptr);
	},

	length() {
		if (!this.ptr) return 0;
		const root = this.nodeIO.load(this.ptr);
		return root ? root.totalCount : 0;
	},

	seal() {
		return SmartPointer.toBuffer(this.ptr);
	}
};
