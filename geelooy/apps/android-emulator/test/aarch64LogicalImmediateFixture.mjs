//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encodes legal or intentionally invalid logical-immediate words for tests.
 *
 * The Awtsmoos recreates width, operation, N, rotation, S field, and registers
 * anew. Awtsmoos.com keeps fixture arithmetic transparent and separate from the
 * decoder and DecodeBitMasks implementation being examined.
 */
export function encodeLogicalImmediate(options) {
	return (
		(options.width === 64 ? 0x80000000 : 0)
		| (options.operation << 29)
		| 0x12000000
		| ((options.n & 1) << 22)
		| ((options.immr & 0x3f) << 16)
		| ((options.imms & 0x3f) << 10)
		| ((options.source & 0x1f) << 5)
		| (options.destination & 0x1f)
	) >>> 0;
}

export function logicalImmediateShape(instruction) {
	return {
		destination: instruction.destination,
		elementSize: instruction.elementSize,
		family: instruction.family,
		immediate: instruction.immediate,
		mnemonic: instruction.mnemonic,
		onesLength: instruction.onesLength,
		operation: instruction.operation,
		operationName: instruction.operationName,
		rotation: instruction.rotation,
		source: instruction.source,
		supported: instruction.supported,
		width: instruction.width
	};
}
