//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module AwtsmoosBTreeExactSeeker
 * @description
 * Resolves one exact map key by reading only the physical B-tree nodes on its
 * root-to-leaf path. Each persisted node is decoded independently and its sorted
 * separator keys are binary-searched, so database size never becomes request RAM
 * and unrelated branches never enter memory or storage I/O.
 */

const Scribe = require('../../utils/leb128/scribe.js');
const Pointer = require('../../utils/pointer/crown.js');
const constants = require('../../constants.js');
const Search = require('./ops/search.js');

/** Decodes the bounded keys and pointer seals contained in one physical map node. */
function decodeNode(buffer) {
	if (!buffer || buffer.length < 5) return null;
	if (buffer.subarray(0, 4).toString() !== constants.MAGIC_MAP) return null;
	const isLeaf = buffer[4] === 1;
	const count = Scribe.read(buffer, 5);
	let position = 5 + count.bytesRead;
	const keys = [];
	const pointers = [];
	for (let index = 0; index < count.value; index += 1) {
		const keyLength = Scribe.read(buffer, position);
		position += keyLength.bytesRead;
		keys.push(buffer.subarray(position, position + keyLength.value));
		position += keyLength.value;
		const pointer = Pointer.decode(buffer, position);
		if (!pointer) return null;
		pointers.push(buffer.subarray(position, position + pointer.byteSize));
		position += pointer.byteSize;
	}
	if (!isLeaf && position < buffer.length) {
		const pointer = Pointer.decode(buffer, position);
		if (pointer) pointers.push(buffer.subarray(position, position + pointer.byteSize));
	}
	return { isLeaf, keys, pointers };
}
/** Chooses the child pointer whose persisted interval can contain the target. */
function childPointer(node, search) {
	const index = search.found ? search.index + 1 : search.index;
	return index < node.pointers.length ? Pointer.decode(node.pointers[index]) : null;
}

/**
 * Descends the persisted B-tree to find one exact key.
 * @param {object} database Open AwtsmoosDB instance.
 * @param {{offset:number,length:number}} rootPointer Physical map root pointer.
 * @param {string|Buffer} key Exact map key.
 * @returns {Buffer|null} Persisted value pointer seal, or null when absent.
 */
function get(database, rootPointer, key) {
	let currentPointer = rootPointer;
	const target = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
	while (currentPointer && currentPointer.offset !== undefined) {
		const raw = database.pager.readExact(currentPointer.offset, currentPointer.length);
		const node = decodeNode(raw);
		if (!node) return null;
		const search = Search.findKey(node, target);
		if (node.isLeaf) {
			return search.found ? node.pointers[search.index] : null;
		}
		currentPointer = childPointer(node, search);
	}
	return null;
}

module.exports = { get };
module.exports.decodeNode = decodeNode;
module.exports.childPointer = childPointer;
