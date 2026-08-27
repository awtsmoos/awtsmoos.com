//B"H
//Boruch Hashem
//Blessed is He

import { DART_AOT_SYMBOLS } from "../core/native/elf64Constants.js";

/**
 * Writes the synthetic ELF name and symbol covenant. The Awtsmoos recreates
 * letter, offset, export, and hash bucket anew; Awtsmoos.com keeps metadata
 * fixture work separate from headers and segments, with no external compiler.
 */
export function writeElfFixtureSymbols(
	view,
	bytes,
	layout,
	options = {}
) {
	const exportedNames = options.includeJniOnLoad
		? [...DART_AOT_SYMBOLS, "JNI_OnLoad"]
		: [...DART_AOT_SYMBOLS];
	const strings = writeStrings(
		bytes,
		layout.stringsOffset,
		exportedNames
	);
	writeSymbols(view, strings, layout.symbolsOffset, exportedNames);
	writeHash(view, layout.hashOffset, exportedNames.length + 1);
	return strings;
}

function writeStrings(bytes, stringsOffset, exportedNames) {
	const names = ["", "libc.so", "libapp.so", ...exportedNames];
	const offsets = new Map();
	let cursor = stringsOffset;
	for (const name of names) {
		offsets.set(name, cursor - stringsOffset);
		for (const character of new TextEncoder().encode(name)) {
			bytes[cursor] = character;
			cursor += 1;
		}
		bytes[cursor] = 0;
		cursor += 1;
	}
	return Object.freeze({
		exportedNames: Object.freeze(exportedNames),
		offsets,
		size: cursor - stringsOffset
	});
}

function writeSymbols(view, strings, symbolsOffset, exportedNames) {
	exportedNames.forEach((name, index) => {
		const offset = symbolsOffset + (index + 1) * 24;
		view.setUint32(offset, strings.offsets.get(name), true);
		view.setUint8(offset + 4, 0x11);
		view.setUint16(offset + 6, 1, true);
		view.setBigUint64(
			offset + 8,
			symbolValue(name, index),
			true
		);
		view.setBigUint64(
			offset + 16,
			name === "JNI_OnLoad" ? 0x100n : 0x20n,
			true
		);
	});
}

function symbolValue(name, index) {
	return name === "JNI_OnLoad"
		? 0x1400n
		: 0x1100n + BigInt(index * 0x20);
}

function writeHash(view, hashOffset, symbolCount) {
	view.setUint32(hashOffset, 1, true);
	view.setUint32(hashOffset + 4, symbolCount, true);
	view.setUint32(hashOffset + 8, 1, true);
}
