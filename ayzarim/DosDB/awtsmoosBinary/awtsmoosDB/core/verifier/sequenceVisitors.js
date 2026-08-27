// B"H

/**
 * @file core/verifier/sequenceVisitors.js
 * @chapter The Ordered Sparks And The Flat Constellation
 * @description
 * Walks B-tree sequence nodes and compact flat-array pointer tables.
 */

const constants = require('../../constants.js');
const Pointer = require('../../utils/pointer/crown.js');
const serializer = require('../../utils/serializer.js');

function visitSequence(verifier, pointer, tag) {
	const bytes = verifier.db._readChainSafe(pointer);
	if (!bytes || bytes.length < 17 || bytes.subarray(0, 4).toString() !== constants.MAGIC_SEQ_NODE) {
		verifier.bad.push({ tag, reason: 'bad-sequence', ptr: pointer });
		return;
	}

	const isLeaf = (bytes.readUInt8(4) & 1) === 1;
	const count = bytes.readUInt16BE(5);
	let position = 17;

	for (let index = 0; index < count; index++) {
		const length = serializer.readVarInt(bytes, position);
		position += length.bytesRead;
		verifier.visitSeal(bytes.subarray(position, position + length.value), `${tag}.seq.${index}`);
		position += length.value;
		if (!isLeaf) position += 4;
	}
}

function visitFlatArray(verifier, pointer, tag) {
	const bytes = verifier.db._readChainSafe(pointer);
	if (!bytes || bytes.length < 10 || bytes.subarray(0, 4).toString() !== 'FLTA') {
		verifier.bad.push({ tag, reason: 'bad-flat-array', ptr: pointer });
		return;
	}

	const count = bytes.readUInt16BE(4);
	let position = 10;
	for (let index = 0; index < count && position < bytes.length; index++) {
		const child = Pointer.decode(bytes, position);
		verifier.visitSeal(bytes.subarray(position, position + child.byteSize), `${tag}.flat.${index}`);
		position += child.byteSize;
	}
}

module.exports = {
	visitSequence,
	visitFlatArray
};
