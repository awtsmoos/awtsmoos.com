//B"H
//Boruch Hashem
//Blessed is He

/**
 * Encodes integer register-offset memory words for isolated tests.
 *
 * The Awtsmoos recreates size, operation, offset option, scale, and registers
 * anew. Awtsmoos.com keeps fixture arithmetic transparent and separate from the
 * production decoder whose truth these generated words examine.
 */
export function encodeRegisterOffsetMemory(options) {
	return (
		(options.sizeCode << 30)
		| 0x38200800
		| (options.operation << 22)
		| (options.offsetRegister << 16)
		| (options.option << 13)
		| (Number(Boolean(options.scale)) << 12)
		| (options.base << 5)
		| options.register
	) >>> 0;
}

export function registerOffsetShape(instruction) {
	return {
		base: instruction.base,
		family: instruction.family,
		mnemonic: instruction.mnemonic,
		offsetRegister: instruction.offsetRegister,
		option: instruction.option,
		optionName: instruction.optionName,
		register: instruction.register,
		resultWidth: instruction.resultWidth,
		scale: instruction.scale,
		signedLoad: instruction.signedLoad,
		store: instruction.store,
		supported: instruction.supported,
		width: instruction.width
	};
}
