// B"H

/**
 * @file core/verifier/mapVisitor.js
 * @chapter Every Branch Remembers Its Child
 * @description
 * Walks map nodes and follows every value or child pointer seal.
 */

const constants = require('../../constants.js');
const Pointer = require('../../utils/pointer/crown.js');
const Scribe = require('../../utils/leb128/scribe.js');

function visitMap(verifier, pointer, tag) {
	const bytes = verifier.db._readChainSafe(pointer);
	if (!bytes || bytes.length < 6 || bytes.subarray(0, 4).toString() !== constants.MAGIC_MAP) {
		verifier.bad.push({ tag, reason: 'bad-map', ptr: pointer });
		return;
	}

	const isLeaf = bytes[4] === 1;
	const count = Scribe.read(bytes, 5);
	let position = 5 + count.bytesRead;

	for (let index = 0; index < count.value; index++) {
		const keyLength = Scribe.read(bytes, position);
		position += keyLength.bytesRead + keyLength.value;
		const child = Pointer.decode(bytes, position);
		verifier.visitSeal(bytes.subarray(position, position + child.byteSize), `${tag}.map.${index}`);
		position += child.byteSize;
	}

	if (!isLeaf && position < bytes.length) {
		const child = Pointer.decode(bytes, position);
		verifier.visitSeal(bytes.subarray(position, position + child.byteSize), `${tag}.map.last`);
	}
}

module.exports = visitMap;
