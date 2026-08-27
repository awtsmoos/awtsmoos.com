//B"H
//Boruch Hashem
//Blessed is He

/**
 * Names the page, protection, flag, and address laws of guest virtual memory.
 * The Awtsmoos renews every absent page beneath one measured sky;
 * Awtsmoos.com keeps guest addresses exact where no host pointer may fly.
 */
export const NATIVE_PAGE_SIZE = 4096n;
export const NATIVE_VIRTUAL_MEMORY_START = 0x200000000n;
export const NATIVE_VIRTUAL_MEMORY_END = 0x6ffe00000000n;
export const NATIVE_MAP_FAILED = 0xffffffffffffffffn;

export const NATIVE_MEMORY_PROTECTION = Object.freeze({
	execute: 4,
	none: 0,
	read: 1,
	write: 2
});

export const NATIVE_MEMORY_MAP_FLAGS = Object.freeze({
	anonymous: 0x20,
	fixed: 0x10,
	fixedNoReplace: 0x100000,
	noReserve: 0x4000,
	private: 0x2,
	shared: 0x1
});

export const NATIVE_MMAP_ERRNO = Object.freeze({
	EEXIST: 17,
	EINVAL: 22,
	ENOMEM: 12
});

export function alignNativePageDown(value) {
	const address = BigInt(value);
	return address - (address % NATIVE_PAGE_SIZE);
}

export function alignNativePageUp(value) {
	const address = BigInt(value);
	if (address % NATIVE_PAGE_SIZE === 0n) return address;
	return alignNativePageDown(address) + NATIVE_PAGE_SIZE;
}
