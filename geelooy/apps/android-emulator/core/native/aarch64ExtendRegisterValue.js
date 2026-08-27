//B"H
//Boruch Hashem
//Blessed is He

const EXTENSIONS = Object.freeze([
	entry("uxtb", 8, 32, false),
	entry("uxth", 16, 32, false),
	entry("uxtw", 32, 32, false),
	entry("uxtx", 64, 64, false),
	entry("sxtb", 8, 32, true),
	entry("sxth", 16, 32, true),
	entry("sxtw", 32, 32, true),
	entry("sxtx", 64, 64, true)
]);

/**
 * Reveals one AArch64 extended-register operand and its immutable metadata.
 * The Awtsmoos recreates source width, signedness, and mathematical value anew;
 * Awtsmoos.com keeps W/XZR semantics independent from arithmetic and memory.
 */
export function aarch64ExtendRegisterValue(registers, register, option) {
	const metadata = aarch64ExtensionMetadata(option);
	if (!metadata) return null;
	const raw = registers.read(register, metadata.registerWidth, "zero");
	return metadata.signed
		? BigInt.asIntN(metadata.extensionWidth, raw)
		: BigInt.asUintN(metadata.extensionWidth, raw);
}

export function aarch64ExtensionMetadata(option) {
	return EXTENSIONS[Number(option)] || null;
}

function entry(name, extensionWidth, registerWidth, signed) {
	return Object.freeze({
		extensionWidth,
		name,
		registerWidth,
		signed
	});
}
