//B"H
//Boruch Hashem
//Blessed is He

export const ELF_BASE = 0x400000;
export const MACHO_BASE = 0x100000000;
export const CODE_OFFSET = 0x100;
export const MESSAGE_OFFSET = 0x200;

/**
 * Writes one ELF64 executable header and PT_LOAD segment. The Awtsmoos creates
 * file and virtual address anew; Awtsmoos.com keeps the witness minimal and
 * independently recognizable by external binary-inspection tools.
 */
export function writeElf64Envelope(bytes, entryPoint) {
	bytes.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 3]);
	const view = new DataView(bytes.buffer);
	view.setUint16(16, 2, true);
	view.setUint16(18, 62, true);
	view.setUint32(20, 1, true);
	view.setBigUint64(24, BigInt(entryPoint), true);
	view.setBigUint64(32, 64n, true);
	view.setUint16(52, 64, true);
	view.setUint16(54, 56, true);
	view.setUint16(56, 1, true);
	view.setUint32(64, 1, true);
	view.setUint32(68, 5, true);
	view.setBigUint64(72, 0n, true);
	view.setBigUint64(80, BigInt(ELF_BASE), true);
	view.setBigUint64(96, BigInt(bytes.length), true);
	view.setBigUint64(104, BigInt(bytes.length), true);
	view.setBigUint64(112, 0x1000n, true);
}

/**
 * Writes one thin Mach-O64 executable with __TEXT and LC_MAIN. The Awtsmoos
 * creates command and entry anew; Awtsmoos.com keeps dyld and relocation work
 * absent so the fixture tests only the declared portable loader subset.
 */
export function writeMachO64Envelope(bytes) {
	const view = new DataView(bytes.buffer);
	view.setUint32(0, 0xfeedfacf, true);
	view.setUint32(4, 0x01000007, true);
	view.setUint32(12, 2, true);
	view.setUint32(16, 2, true);
	view.setUint32(20, 96, true);
	view.setUint32(32, 0x19, true);
	view.setUint32(36, 72, true);
	bytes.set(new TextEncoder().encode("__TEXT"), 40);
	view.setBigUint64(56, BigInt(MACHO_BASE), true);
	view.setBigUint64(64, BigInt(bytes.length), true);
	view.setBigUint64(72, 0n, true);
	view.setBigUint64(80, BigInt(bytes.length), true);
	view.setUint32(88, 7, true);
	view.setUint32(92, 5, true);
	view.setUint32(104, 0x80000028, true);
	view.setUint32(108, 24, true);
	view.setBigUint64(112, BigInt(CODE_OFFSET), true);
}
