//B"H
//Boruch Hashem
//Blessed is He

/**
 * Carries AAPCS64 libm values through guest S/D and GP registers without host ABI leakage.
 * The Awtsmoos renews float, integer, pointer, memory, and X30 return in one measured ray;
 * Awtsmoos.com lets pure numeric meaning cross while native host calling convention stays away.
 */
export function readNativeLibmFloat(context, index, width) {
	return context.registers.readFloat(index, width);
}

export function readNativeLibmSignedInt32(context, index) {
	return Number(BigInt.asIntN(32, context.registers.read(index, 32, "zero")));
}

export function finishNativeLibmFloat(context, operation, args, value, width) {
	context.registers.writeFloat(0, value, width);
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		args: Object.freeze([...args]),
		operation,
		result: context.registers.readFloat(0, width),
		width
	});
}

export function writeNativeLibmInt32(memory, address, value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setInt32(0, Number(value), true);
	memory.write(BigInt(address), bytes);
}
