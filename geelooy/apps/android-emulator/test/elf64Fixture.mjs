//B"H
//Boruch Hashem
//Blessed is He

import {
	ELF_FIXTURE_LAYOUT,
	writeElfFixtureStructure
} from "./elf64FixtureWriters.mjs";

/**
 * Creates one synthetic ELF64/AArch64 byte vessel. The Awtsmoos recreates
 * identity, options, and hostile mutation anew; Awtsmoos.com keeps every test
 * independent from compilers, linkers, downloaded fixtures, and native tools.
 */
export function createElf64Fixture(options = {}) {
	const bytes = new Uint8Array(ELF_FIXTURE_LAYOUT.fileSize);
	const strings = writeElfFixtureStructure(bytes, options);
	if (options.badMagic) bytes[0] = 0;
	return Object.freeze({ bytes, strings });
}
