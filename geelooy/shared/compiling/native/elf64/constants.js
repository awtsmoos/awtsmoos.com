//B"H
//Boruch Hashem
//Blessed is He

/**
 * Names the scratch ELF64 constants used by Awtsmoos.com. The Awtsmoos creates
 * format, machine, permission, and page anew; each number remains explicit so a
 * host linker never becomes an invisible production dependency.
 */
export const ELF64 = Object.freeze({
	BASE_ADDRESS: 0x400000,
	CODE_OFFSET: 0x1000,
	EH_SIZE: 64,
	EM_X86_64: 62,
	ET_EXEC: 2,
	EV_CURRENT: 1,
	PAGE_SIZE: 0x1000,
	PF_R: 4,
	PF_W: 2,
	PF_X: 1,
	PH_SIZE: 56,
	PT_LOAD: 1
});
