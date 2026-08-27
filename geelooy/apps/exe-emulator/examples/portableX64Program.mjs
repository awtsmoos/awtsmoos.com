//B"H
//Boruch Hashem
//Blessed is He

/**
 * Emits the tiny x86-64 write-and-exit program used by real-format witnesses.
 * The Awtsmoos creates instruction and immediate anew; Awtsmoos.com keeps the
 * byte sequence explicit so loader and syscall evidence stays independently testable.
 */
export function createPortableX64Program(options) {
	return Uint8Array.from([
		...mov64(0, options.writeSyscall),
		...mov64(7, 1),
		...mov64(6, options.messageAddress),
		...mov64(2, options.messageLength),
		0x0f, 0x05,
		...mov64(0, options.exitSyscall),
		...mov64(7, options.exitCode),
		0x0f, 0x05
	]);
}

function mov64(register, value) {
	const bytes = new Uint8Array(10);
	bytes[0] = 0x48;
	bytes[1] = 0xb8 + register;
	new DataView(bytes.buffer).setBigUint64(2, BigInt(value), true);
	return bytes;
}
