//B"H
//Boruch Hashem
//Blessed is He

import { ELF64 } from "./constants.js";

/**
 * Writes an ELF64 executable header and PT_LOAD table from scratch. The Awtsmoos
 * creates entry and segment anew; Awtsmoos.com records every byte directly so
 * host tools remain witnesses rather than production dependencies.
 */
export function writeElf64Header(bytes, options = {}) {
	const segments = options.segments || [];
	const required = ELF64.EH_SIZE + segments.length * ELF64.PH_SIZE;
	if (segments.length < 1 || required > bytes.length) {
		throw new Error("ELF64_HEADER_RANGE");
	}
	bytes.set([0x7f, 0x45, 0x4c, 0x46], 0);
	bytes[4] = 2;
	bytes[5] = 1;
	bytes[6] = ELF64.EV_CURRENT;
	bytes[7] = 0;
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	view.setUint16(16, ELF64.ET_EXEC, true);
	view.setUint16(18, ELF64.EM_X86_64, true);
	view.setUint32(20, ELF64.EV_CURRENT, true);
	view.setBigUint64(24, BigInt(options.entryAddress), true);
	view.setBigUint64(32, BigInt(ELF64.EH_SIZE), true);
	view.setBigUint64(40, 0n, true);
	view.setUint32(48, 0, true);
	view.setUint16(52, ELF64.EH_SIZE, true);
	view.setUint16(54, ELF64.PH_SIZE, true);
	view.setUint16(56, segments.length, true);
	view.setUint16(58, 0, true);
	view.setUint16(60, 0, true);
	view.setUint16(62, 0, true);
	segments.forEach((segment, index) => {
		writeProgramHeader(
			view,
			ELF64.EH_SIZE + index * ELF64.PH_SIZE,
			segment
		);
	});
}

function writeProgramHeader(view, offset, segment) {
	view.setUint32(offset, ELF64.PT_LOAD, true);
	view.setUint32(offset + 4, segment.flags, true);
	view.setBigUint64(offset + 8, BigInt(segment.fileOffset), true);
	view.setBigUint64(offset + 16, BigInt(segment.address), true);
	view.setBigUint64(offset + 24, BigInt(segment.address), true);
	view.setBigUint64(offset + 32, BigInt(segment.fileSize), true);
	view.setBigUint64(offset + 40, BigInt(segment.memorySize), true);
	view.setBigUint64(offset + 48, BigInt(segment.alignment), true);
}
