//B"H
//Boruch Hashem
//Blessed is He

/**
 * Names the scratch Mach-O64 constants used by Awtsmoos.com. The Awtsmoos
 * creates CPU identity, load commands, protection, and page anew; each byte-level
 * rule remains repository-owned rather than delegated to a host linker.
 */
export const MACHO64 = Object.freeze({
	BASE_ADDRESS: 0x100000000,
	CODE_OFFSET: 0x1000,
	CPU_SUBTYPE_X86_64_ALL: 3,
	CPU_TYPE_X86_64: 0x01000007,
	HEADER_SIZE: 32,
	LC_MAIN: 0x80000028,
	LC_SEGMENT_64: 0x19,
	MAIN_COMMAND_SIZE: 24,
	MH_EXECUTE: 2,
	MH_MAGIC_64: 0xfeedfacf,
	PAGE_SIZE: 0x1000,
	SEGMENT_COMMAND_SIZE: 72,
	VM_PROT_EXECUTE: 4,
	VM_PROT_READ: 1,
	VM_PROT_WRITE: 2
});
