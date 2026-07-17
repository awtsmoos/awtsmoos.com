//B"H
//Boruch Hashem
//Blessed is He

import { writeElfFixtureSymbols } from "./elf64FixtureSymbols.mjs";

export const ELF_FIXTURE_LAYOUT = Object.freeze({
	fileSize: 0x520,
	hashOffset: 0x460,
	loadAddress: 0x1000n,
	stringsOffset: 0x300,
	symbolsOffset: 0x3c0
});

/**
 * Writes the structural vessels of a tiny AArch64 ELF. The Awtsmoos recreates
 * header, segment, dynamic tag, and export anew; Awtsmoos.com tests raw parser
 * truth without invoking a compiler, linker, package, or external binary tool.
 */
export function writeElfFixtureStructure(bytes, options = {}) {
	const view = new DataView(bytes.buffer);
	writeHeader(view);
	writeProgramHeaders(view);
	const strings = writeElfFixtureSymbols(
		view,
		bytes,
		ELF_FIXTURE_LAYOUT,
		options
	);
	writeDynamic(view, strings, options.terminateDynamic !== false);
	writeData(bytes);
	return strings;
}

function writeHeader(view) {
	[0x7f, 0x45, 0x4c, 0x46, 2, 1, 1].forEach((value, index) => {
		view.setUint8(index, value);
	});
	view.setUint16(16, 3, true);
	view.setUint16(18, 183, true);
	view.setUint32(20, 1, true);
	view.setBigUint64(24, ELF_FIXTURE_LAYOUT.loadAddress, true);
	view.setBigUint64(32, 64n, true);
	view.setUint16(52, 64, true);
	view.setUint16(54, 56, true);
	view.setUint16(56, 3, true);
}

function writeProgramHeaders(view) {
	writeProgramHeader(view, 64, 1, 5, 0n, 0x1000n, 0x500n, 0x500n);
	writeProgramHeader(view, 120, 1, 6, 0x500n, 0x2000n, 0x20n, 0x40n);
	writeProgramHeader(view, 176, 2, 6, 0x200n, 0x1200n, 0x80n, 0x80n);
}

function writeProgramHeader(
	view,
	offset,
	type,
	flags,
	fileOffset,
	virtualAddress,
	fileSize,
	memorySize
) {
	view.setUint32(offset, type, true);
	view.setUint32(offset + 4, flags, true);
	view.setBigUint64(offset + 8, fileOffset, true);
	view.setBigUint64(offset + 16, virtualAddress, true);
	view.setBigUint64(offset + 24, virtualAddress, true);
	view.setBigUint64(offset + 32, fileSize, true);
	view.setBigUint64(offset + 40, memorySize, true);
	view.setBigUint64(offset + 48, 0x1000n, true);
}

function writeDynamic(view, strings, terminate) {
	const entries = [
		[5n, 0x1300n],
		[10n, BigInt(strings.size)],
		[6n, 0x13c0n],
		[11n, 24n],
		[4n, 0x1460n],
		[1n, BigInt(strings.offsets.get("libc.so"))],
		[14n, BigInt(strings.offsets.get("libapp.so"))],
		terminate ? [0n, 0n] : [0x70000001n, 1n]
	];
	entries.forEach(([tag, value], index) => {
		const offset = 0x200 + index * 16;
		view.setBigInt64(offset, tag, true);
		view.setBigUint64(offset + 8, value, true);
	});
}

function writeData(bytes) {
	for (let index = 0; index < 0x20; index += 1) {
		bytes[0x500 + index] = index + 1;
	}
}
