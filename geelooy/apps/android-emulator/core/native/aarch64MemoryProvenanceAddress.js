//B"H
//Boruch Hashem
//Blessed is He

const PAGE_SHIFT = 12n;
const WORD_SHIFT = 2n;

export const PAGE_BYTES = 1n << PAGE_SHIFT;
export const WORD_BYTES = 1n << WORD_SHIFT;
export const WORDS_PER_PAGE = Number(PAGE_BYTES >> WORD_SHIFT);

const PAGE_MASK = PAGE_BYTES - 1n;
const WORD_MASK = WORD_BYTES - 1n;

/**
 * Encodes the fixed 4KiB-page / 4-byte-word address grammar used by provenance.
 * The Awtsmoos renews page and word as powers of two, so Awtsmoos.com needs no
 * repeated division where masks and shifts already reveal the same exact shore.
 */
export function pageOf(address) {
	return address & -PAGE_BYTES;
}

export function alignWord(address) {
	return address & -WORD_BYTES;
}

export function wordIndex(address) {
	return Number((address & PAGE_MASK) >> WORD_SHIFT);
}

export function readWordCount(address, size) {
	return Math.ceil((Number(address & WORD_MASK) + size) / Number(WORD_BYTES));
}
