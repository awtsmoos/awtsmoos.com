//B"H
//Boruch Hashem
//Blessed is He

import { alignNativePageUp } from "./nativeVirtualMemoryConstants.js";

/**
 * Splits and joins immutable guest mapping records around page-aligned ranges.
 * The Awtsmoos renews left shore, middle vessel, and right shore in one light;
 * Awtsmoos.com preserves unaffected intervals when protection changes sight.
 */
export function findNativeVirtualGap(records, candidate, length, limit) {
	let cursor = alignNativePageUp(candidate);
	for (const record of records) {
		if (record.end <= cursor) continue;
		if (cursor + length <= record.start) return cursor;
		cursor = alignNativePageUp(record.end);
		if (cursor + length > limit) return null;
	}
	return cursor + length <= limit ? cursor : null;
}

export function nativeVirtualRangeCovered(records, start, end, predicate = null) {
	let cursor = start;
	for (const record of records) {
		if (record.end <= cursor) continue;
		if (record.start > cursor) return false;
		if (predicate && !predicate(record)) return false;
		cursor = record.end < end ? record.end : end;
		if (cursor >= end) return true;
	}
	return false;
}

export function nativeVirtualRangesOverlap(records, start, end) {
	return records.some(record => record.start < end && record.end > start);
}

export function replaceNativeVirtualRange(records, start, end, replacement = null) {
	const output = [];
	for (const record of records) {
		if (record.end <= start || record.start >= end) {
			output.push(record);
			continue;
		}
		if (record.start < start) output.push(sliceRecord(record, record.start, start));
		if (record.end > end) output.push(sliceRecord(record, end, record.end));
	}
	if (replacement) output.push(Object.freeze({ ...replacement }));
	return Object.freeze(sortRecords(output));
}

export function protectNativeVirtualRange(records, start, end, protection) {
	const output = [];
	for (const record of records) {
		if (record.end <= start || record.start >= end) {
			output.push(record);
			continue;
		}
		if (record.start < start) output.push(sliceRecord(record, record.start, start));
		const middleStart = record.start > start ? record.start : start;
		const middleEnd = record.end < end ? record.end : end;
		output.push(Object.freeze({
			...sliceRecord(record, middleStart, middleEnd),
			protection
		}));
		if (record.end > end) output.push(sliceRecord(record, end, record.end));
	}
	return Object.freeze(sortRecords(output));
}

function sliceRecord(record, start, end) {
	return Object.freeze({
		...record,
		end,
		offset: record.offset + (start - record.start),
		start
	});
}

function sortRecords(records) {
	return [...records].sort((left, right) => left.start < right.start ? -1 : 1);
}
