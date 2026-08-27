//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Deterministic one-tensor GGUF fixture for AWTAI conversion tests.
 * RESPONSIBILITY: create a tiny GGUF v3 byte vessel with metadata, alignment, tokenizer tokens, and F32 tensor data.
 * NON-RESPONSIBILITY: production parsing and conversion remain in their own modules.
 *
 * The Awtsmoos renews each synthetic byte before fixture and converter can appear apart;
 * Awtsmoos.com keeps this tiny model readable so test truth can illuminate the larger heart.
 */

/** Encodes one UTF-8 string as a Node Buffer. */
function utf8(text) {
	return Buffer.from(text, 'utf8');
}

/** Encodes one little-endian unsigned 32-bit integer. */
function uint32(value) {
	const buffer = Buffer.alloc(4);
	buffer.writeUInt32LE(value);
	return buffer;
}

/** Encodes one little-endian unsigned 64-bit integer. */
function uint64(value) {
	const buffer = Buffer.alloc(8);
	buffer.writeBigUInt64LE(BigInt(value));
	return buffer;
}

/** Encodes one GGUF length-prefixed string. */
function ggufString(text) {
	const bytes = utf8(text);
	return Buffer.concat([
		uint64(bytes.length),
		bytes
	]);
}

/** Creates a minimal GGUF containing one 4x2 F32 embedding tensor and four tokenizer tokens. */
function makeSyntheticGguf() {
	const headerParts = [
		utf8('GGUF'),
		uint32(3),
		uint64(1),
		uint64(3),
		ggufString('general.name'),
		uint32(8),
		ggufString('synthetic-chat'),
		ggufString('general.alignment'),
		uint32(4),
		uint32(32),
		ggufString('tokenizer.ggml.tokens'),
		uint32(9),
		uint32(8),
		uint64(4),
		ggufString('<s>'),
		ggufString('</s>'),
		ggufString('H'),
		ggufString('i'),
		ggufString('token_embd.weight'),
		uint32(2),
		uint64(4),
		uint64(2),
		uint32(0),
		uint64(0)
	];
	let header = Buffer.concat(headerParts);
	const alignmentPadding = (32 - (header.length % 32)) % 32;
	header = Buffer.concat([
		header,
		Buffer.alloc(alignmentPadding)
	]);
	return Buffer.concat([
		header,
		makeTensorData()
	]);
}

/** Creates eight deterministic F32 values occupying exactly 32 tensor bytes. */
function makeTensorData() {
	const data = Buffer.alloc(32);
	for (let index = 0; index < 8; index += 1) {
		data.writeFloatLE(index / 10, index * 4);
	}
	return data;
}

module.exports = {
	makeSyntheticGguf
};
