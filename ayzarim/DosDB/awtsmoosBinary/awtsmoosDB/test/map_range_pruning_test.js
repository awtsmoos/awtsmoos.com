//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BTreeRangePruningTest
 * @description
 * Proves a narrow map range loads only B-tree children whose separator intervals
 * can contain requested keys. This guards the disk-native search law: prefix/range
 * lookup must not walk the entire database merely because RAM stays bounded.
 */

const assert = require('assert');
const constants = require('../constants.js');
const SmartPointer = require('../utils/smartPointer/index.js');
const walk = require('../structure/map/walker.js');

/** Builds one synthetic leaf whose key buffers mirror persisted map nodes. */
function leaf(...keys) {
	return {
		isLeaf: true,
		keys: keys.map(key => Buffer.from(key)),
		values: keys.map(key => Buffer.from(`ptr:${key}`))
	};
}

/** Encodes a tiny stable child pointer accepted by the production SmartPointer decoder. */
function pointer(offset) {
	return SmartPointer.encode(constants.VAL_TYPE.MAP, offset, 1);
}
/** Runs one branch-pruning proof using three disjoint child intervals. */
function run() {
	const children = new Map([
		[10, leaf('a', 'b', 'c')],
		[20, leaf('m', 'n', 'o')],
		[30, leaf('t', 'u', 'z')]
	]);
	const loads = [];
	const nodeIO = {
		load(decoded) {
			loads.push(decoded.offset);
			return children.get(decoded.offset);
		}
	};
	const root = {
		isLeaf: false,
		keys: [Buffer.from('m'), Buffer.from('t')],
		children: [pointer(10), pointer(20), pointer(30)]
	};
	const rows = [...walk(nodeIO, root, 'n', 'o')];
	assert.deepEqual(rows.map(row => row.key.toString()), ['n', 'o']);
	assert.deepEqual(loads, [20]);
}

run();
console.log('B"H map range pruning test passed');
