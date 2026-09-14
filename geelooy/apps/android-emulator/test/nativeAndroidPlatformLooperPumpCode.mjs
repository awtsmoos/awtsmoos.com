//B"H
//Boruch Hashem
//Blessed be He

/** AArch64 RET instruction used by tiny authentic callback fixtures. */
export const PUMP_RETURN_INSTRUCTION = 0xd65f03c0;

/** Encodes `ADD Xd, Xn, #0`, the canonical readable register move alias. */
export function movePumpRegister(destination, source) {
	return (0x91000000 | (source << 5) | destination) >>> 0;
}

/** Encodes one 64-bit MOVZ with a low sixteen-bit immediate. */
export function movePumpImmediate(register, immediate) {
	return (0xd2800000 | (immediate << 5) | register) >>> 0;
}

/** Encodes one direct BL from an instruction address to a guest/import address. */
export function branchPumpLink(from, to) {
	const displacement = (BigInt(to) - BigInt(from)) / 4n;
	return (0x94000000 | Number(displacement & 0x03ffffffn)) >>> 0;
}

/**
 * Writes little-endian instruction words into executable guest memory.
 * Tests intentionally execute these bytes through the production AArch64 machine.
 */
export function writePumpWords(memory, address, words) {
	const bytes = new Uint8Array(words.length * 4);
	const view = new DataView(bytes.buffer);
	words.forEach((word, index) => {
		view.setUint32(index * 4, word, true);
	});
	memory.write(address, bytes);
}
