//B"H
//Boruch Hashem
//Blessed is He

/**
 * Names the relocation covenant for ELF64/AArch64. The Awtsmoos recreates tag,
 * symbol index, relocation kind, and loader arithmetic anew; Awtsmoos.com keeps
 * every native pointer repair explicit instead of hiding it in a host linker.
 */
export const ELF_RELOCATION_TAG = Object.freeze({
	jumpRelocations: 23n,
	pltRelocationSize: 2n,
	pltRelocationType: 20n,
	rela: 7n,
	relaCount: 0x6ffffff9n,
	relaEntrySize: 9n,
	relaSize: 8n
});

export const ELF_RELOCATION_FORMAT = Object.freeze({
	rela: 7n,
	relaEntrySize: 24
});

export const AARCH64_RELOCATION = Object.freeze({
	abs64: 257,
	globDat: 1025,
	irelative: 1032,
	jumpSlot: 1026,
	none: 0,
	relative: 1027
});

export const AARCH64_RELOCATION_NAME = Object.freeze({
	0: "R_AARCH64_NONE",
	257: "R_AARCH64_ABS64",
	1025: "R_AARCH64_GLOB_DAT",
	1026: "R_AARCH64_JUMP_SLOT",
	1027: "R_AARCH64_RELATIVE",
	1032: "R_AARCH64_IRELATIVE"
});

export const ELF_RELOCATION_LIMIT = 1000000;
