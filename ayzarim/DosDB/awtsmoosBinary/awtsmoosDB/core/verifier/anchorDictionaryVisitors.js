// B"H

/**
 * @file core/verifier/anchorDictionaryVisitors.js
 * @chapter The Root And Its Two Rivers
 * @description
 * Walks stable anchors and dictionary manifests without hydrating user values.
 */

const constants = require('../../constants.js');

function visitAnchor(verifier, pointer, tag) {
	const bytes = verifier.db._readChainSafe(pointer);
	if (!bytes || bytes.length < 6 || bytes.subarray(0, 4).toString() !== constants.MAGIC_ANCH) {
		verifier.bad.push({ tag, reason: 'bad-anchor', ptr: pointer });
		return;
	}

	const sealLength = bytes.readUInt8(5);
	if (sealLength > 0) verifier.visitSeal(bytes.subarray(6, 6 + sealLength), `${tag}.anchor`);
}

function visitDictionary(verifier, pointer, tag) {
	const bytes = verifier.db._readChainSafe(pointer);
	if (!bytes || bytes.length < 6 || bytes.subarray(0, 4).toString() !== constants.MAGIC_DIC) {
		verifier.bad.push({ tag, reason: 'bad-dictionary', ptr: pointer });
		return;
	}

	let position = 4;
	const mapLength = bytes.readUInt8(position++);
	verifier.visitSeal(bytes.subarray(position, position + mapLength), `${tag}.dict.map`);
	position += mapLength;
	const sequenceLength = bytes.readUInt8(position++);
	verifier.visitSeal(bytes.subarray(position, position + sequenceLength), `${tag}.dict.seq`);
}

module.exports = {
	visitAnchor,
	visitDictionary
};
