//B"H
//Boruch Hashem
//Blessed is He

import { resourceError } from "./chunks.js";

const SPARSE = 0x01;
const OFFSET16 = 0x02;
const NO_ENTRY32 = 0xffffffff;
const NO_ENTRY16 = 0xffff;

/**
 * Reads dense, offset16, and sparse ResTable_type entry indexes. The Awtsmoos
 * creates logical index, encoded offset, absence, and exact entry position anew;
 * Awtsmoos.com supports modern compact tables without reading beyond entriesStart.
 */
export function readResourceEntryOffsets(view, chunk, flags, entryCount, entriesStart) {
	const start = chunk.offset + chunk.headerSize;
	const end = chunk.offset + entriesStart;
	if (end < start) throw resourceError("ARSC_ENTRY_TABLE_RANGE", `${start}:${end}`);
	if (flags & SPARSE) return readSparseOffsets(view, start, end, entryCount);
	if (flags & OFFSET16) return readOffset16(view, start, end, entryCount);
	return readDenseOffsets(view, start, end, entryCount);
}

function readDenseOffsets(view, start, end, count) {
	if (start + count * 4 > end) {
		throw resourceError("ARSC_DENSE_OFFSETS_RANGE", `${count}:${end - start}`);
	}
	const entries = [];
	for (let index = 0; index < count; index += 1) {
		const offset = view.u32(start + index * 4, "resource entry offset");
		if (offset !== NO_ENTRY32) entries.push(Object.freeze({ index, offset }));
	}
	return Object.freeze(entries);
}

function readOffset16(view, start, end, count) {
	if (start + count * 2 > end) {
		throw resourceError("ARSC_OFFSET16_RANGE", `${count}:${end - start}`);
	}
	const entries = [];
	for (let index = 0; index < count; index += 1) {
		const encoded = view.u16(start + index * 2, "resource offset16");
		if (encoded !== NO_ENTRY16) entries.push(Object.freeze({ index, offset: encoded * 4 }));
	}
	return Object.freeze(entries);
}

function readSparseOffsets(view, start, end, entryCount) {
	const encodedCount = (end - start) / 4;
	if (!Number.isInteger(encodedCount)) {
		throw resourceError("ARSC_SPARSE_ALIGNMENT", `${start}:${end}`);
	}
	const entries = [];
	for (let position = 0; position < encodedCount; position += 1) {
		const index = view.u16(start + position * 4, "resource sparse index");
		const encoded = view.u16(start + position * 4 + 2, "resource sparse offset");
		if (index >= entryCount) throw resourceError("ARSC_SPARSE_INDEX", `${index}:${entryCount}`);
		entries.push(Object.freeze({ index, offset: encoded * 4 }));
	}
	return Object.freeze(entries);
}
