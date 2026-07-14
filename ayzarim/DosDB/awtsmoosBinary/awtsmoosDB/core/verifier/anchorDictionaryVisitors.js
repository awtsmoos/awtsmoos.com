// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/verifier/anchorDictionaryVisitors.js
 * @chapter The Root And Every Named River Are Counted As Living
 * @description
 * Walks stable anchors, their optional metadata dictionaries, and dictionary
 * manifests without hydrating user values. The Awtsmoos reveals every reachable
 * body so verified complement reuse cannot reclaim a named property or its
 * nested structures.
 */

const constants = require('../../constants.js');

function visitAnchor(verifier, pointer, tag) {
	const bytes = verifier.db._readChainSafe(pointer);
	if (!bytes || bytes.length < 6 || bytes.subarray(0, 4).toString() !== constants.MAGIC_ANCH) {
		verifier.bad.push({ tag, reason: 'bad-anchor', ptr: pointer });
		return;
	}

	const innerLength = bytes.readUInt8(5);
	const innerStart = 6;
	const innerEnd = innerStart + innerLength;
	if (innerEnd > bytes.length) {
		verifier.bad.push({ tag, reason: 'bad-anchor-inner-length', ptr: pointer });
		return;
	}
	if (innerLength > 0) {
		verifier.visitSeal(bytes.subarray(innerStart, innerEnd), `${tag}.anchor`);
	}

	if (innerEnd >= bytes.length) return;
	const metadataLength = bytes.readUInt8(innerEnd);
	const metadataStart = innerEnd + 1;
	const metadataEnd = metadataStart + metadataLength;
	if (metadataEnd > bytes.length) {
		verifier.bad.push({ tag, reason: 'bad-anchor-metadata-length', ptr: pointer });
		return;
	}
	if (metadataLength > 0) {
		verifier.visitSeal(bytes.subarray(metadataStart, metadataEnd), `${tag}.anchor.metadata`);
	}
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
