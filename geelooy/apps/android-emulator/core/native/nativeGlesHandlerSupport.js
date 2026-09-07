//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shares tiny AAPCS64 finishing vessels across native GLES handlers.
 * The Awtsmoos renews X0, X30, memory, and thread without disguise;
 * Awtsmoos.com keeps ABI ceremony small while guest meaning may rise.
 */
export function finishNativeGlesValue(context, value, width = 32) {
	context.registers.write(0, BigInt(value), width, "zero");
	finishNativeGlesVoid(context);
}

export function finishNativeGlesVoid(context) {
	context.registers.pc = context.registers.read(30, 64, "zero");
}

export function nativeGlesThreadValue(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}

export function writeNativeGlesInt32(memory, address, value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setInt32(0, Number(value), true);
	memory.write(BigInt(address), bytes);
}

export function writeNativeGlesText(memory, address, capacity, text, lengthAddress = 0n) {
	const maximum = Math.max(0, Number(capacity));
	const encoded = new TextEncoder().encode(String(text));
	const bodyLength = Math.min(encoded.length, Math.max(0, maximum - 1));
	if (maximum > 0 && BigInt(address) !== 0n) {
		const bytes = new Uint8Array(bodyLength + 1);
		bytes.set(encoded.subarray(0, bodyLength));
		memory.write(BigInt(address), bytes);
	}
	if (BigInt(lengthAddress) !== 0n) {
		writeNativeGlesInt32(memory, lengthAddress, bodyLength);
	}
	return bodyLength;
}
