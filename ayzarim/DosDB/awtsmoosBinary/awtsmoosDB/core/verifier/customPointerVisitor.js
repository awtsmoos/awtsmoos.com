// B"H

/**
 * @file core/verifier/customPointerVisitor.js
 * @chapter Opaque Bodies Remain Alive And Known Vessels Reveal Their Children
 * @description
 * Preserves every custom-instance body through the parent verifier seal, then
 * follows generic instance dictionaries and VN01 vector payload pointers.
 */

const serializer = require('../../utils/serializer.js');

function visitCustomPointer(verifier, pointer, tag) {
	const bytes = verifier.db._readChainSafe(pointer);
	if (!bytes || bytes.length === 0) {
		verifier.bad.push({ tag, reason: 'empty-custom-body', ptr: pointer });
		return;
	}
	if (bytes.length >= 4 && bytes.subarray(0, 4).toString() === 'VN01') {
		visitVectorNode(verifier, bytes, tag);
		return;
	}
	visitGenericInstance(verifier, bytes, tag);
}

function visitVectorNode(verifier, bytes, tag) {
	if (bytes.length < 14) {
		verifier.bad.push({ tag, reason: 'short-vector-node' });
		return;
	}
	const vectorBytes = bytes.readUInt32BE(6);
	let position = 10 + vectorBytes;
	if (position >= bytes.length) {
		verifier.bad.push({ tag, reason: 'vector-node-out-of-bounds' });
		return;
	}
	const payloadLength = serializer.readVarInt(bytes, position);
	position += payloadLength.bytesRead;
	if (payloadLength.value < 0 || position + payloadLength.value > bytes.length) {
		verifier.bad.push({ tag, reason: 'vector-payload-out-of-bounds' });
		return;
	}
	if (payloadLength.value > 0) {
		verifier.visitSeal(
			bytes.subarray(position, position + payloadLength.value),
			`${tag}.vector.payload`
		);
	}
}

function visitGenericInstance(verifier, bytes, tag) {
	try {
		let position = skipString(bytes, 0);
		position = skipString(bytes, position);
		const sealLength = serializer.readVarInt(bytes, position);
		position += sealLength.bytesRead;
		if (sealLength.value <= 0 || position + sealLength.value > bytes.length) return;
		verifier.visitSeal(
			bytes.subarray(position, position + sealLength.value),
			`${tag}.instance.dictionary`
		);
	} catch (_error) {
		// Unknown custom bodies are intentionally opaque but remain reachable.
	}
}

function skipString(bytes, position) {
	const length = serializer.readVarInt(bytes, position);
	const next = position + length.bytesRead + length.value;
	if (length.value < 0 || next > bytes.length) throw new Error('custom string out of bounds');
	return next;
}

module.exports = visitCustomPointer;
