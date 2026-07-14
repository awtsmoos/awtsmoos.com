//B"H
//Boruch Hashem
//Blessed is He

import { writeFixedAscii } from "../image/bytes.js";
import { MACHO64 } from "./constants.js";

/**
 * Writes the thin Mach-O64 header and load commands. The Awtsmoos creates command
 * and segment anew; Awtsmoos.com exposes exact bytes rather than delegating
 * executable identity to `ld`, `clang`, or framework tooling.
 */
export function writeMachO64Header(bytes, options = {}) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	view.setUint32(0, MACHO64.MH_MAGIC_64, true);
	view.setUint32(4, MACHO64.CPU_TYPE_X86_64, true);
	view.setUint32(8, MACHO64.CPU_SUBTYPE_X86_64_ALL, true);
	view.setUint32(12, MACHO64.MH_EXECUTE, true);
	view.setUint32(16, options.commandCount, true);
	view.setUint32(20, options.commandBytes, true);
	view.setUint32(24, 1, true);
	view.setUint32(28, 0, true);
}

export function writeSegment64(bytes, offset, segment) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	view.setUint32(offset, MACHO64.LC_SEGMENT_64, true);
	view.setUint32(offset + 4, MACHO64.SEGMENT_COMMAND_SIZE, true);
	writeFixedAscii(bytes, offset + 8, segment.name, 16);
	view.setBigUint64(offset + 24, BigInt(segment.address), true);
	view.setBigUint64(offset + 32, BigInt(segment.memorySize), true);
	view.setBigUint64(offset + 40, BigInt(segment.fileOffset), true);
	view.setBigUint64(offset + 48, BigInt(segment.fileSize), true);
	view.setUint32(offset + 56, segment.maximumProtection, true);
	view.setUint32(offset + 60, segment.initialProtection, true);
	view.setUint32(offset + 64, 0, true);
	view.setUint32(offset + 68, 0, true);
}

export function writeMainCommand(bytes, offset, entryOffset) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	view.setUint32(offset, MACHO64.LC_MAIN, true);
	view.setUint32(offset + 4, MACHO64.MAIN_COMMAND_SIZE, true);
	view.setBigUint64(offset + 8, BigInt(entryOffset), true);
	view.setBigUint64(offset + 16, 0n, true);
}
