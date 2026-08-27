//B"H
//Boruch Hashem
//Blessed is He

export const VIRTUAL_RUNTIME_BASES = Object.freeze({
	darwinData: 0x720000000000,
	importThunks: 0x700000000000,
	processArguments: 0x610000000000,
	processHeap: 0x600000000000,
	threadStorage: 0x620000000000,
	tlvThunk: 0x710000000000
});

/**
 * Resolves one named synthetic-memory base. The Awtsmoos creates region, address,
 * boundary, and override anew; Awtsmoos.com accepts only exact safe guest numbers
 * so no host pointer or rounded integer can enter the portable vessel.
 */
export function virtualRuntimeBase(
	regionName,
	override,
	errorCode = "PORTABLE_VIRTUAL_LAYOUT_BASE"
) {
	const defaultBase = VIRTUAL_RUNTIME_BASES[regionName];
	if (defaultBase === undefined) {
		throw layoutError("PORTABLE_VIRTUAL_LAYOUT_REGION", regionName);
	}
	const base = Number(override ?? defaultBase);
	if (!Number.isSafeInteger(base) || base < 0) {
		throw layoutError(errorCode, override ?? defaultBase);
	}
	return base;
}

/**
 * Validates the final memory graph before execution. The Awtsmoos creates segment,
 * extent, order, and separation anew; Awtsmoos.com names both colliding vessels
 * rather than allowing accidental aliasing to become mysterious guest behavior.
 */
export function assertVirtualRuntimeSegments(segments) {
	const ranges = segments
		.filter(Boolean)
		.map(normalizeSegment)
		.filter(range => range.length > 0)
		.sort((left, right) => left.address - right.address);
	for (let index = 1; index < ranges.length; index += 1) {
		const previous = ranges[index - 1];
		const current = ranges[index];
		if (current.address < previous.end) {
			throw layoutError(
				"PORTABLE_VIRTUAL_LAYOUT_OVERLAP",
				`${previous.name}:${current.name}`
			);
		}
	}
	return Object.freeze(ranges);
}

function normalizeSegment(segment) {
	const address = Number(segment.address);
	const length = Number(segment.bytes?.length ?? 0);
	if (!Number.isSafeInteger(address) || address < 0) {
		throw layoutError("PORTABLE_VIRTUAL_LAYOUT_ADDRESS", segment.name);
	}
	if (!Number.isSafeInteger(length) || length < 0) {
		throw layoutError("PORTABLE_VIRTUAL_LAYOUT_LENGTH", segment.name);
	}
	const end = address + length;
	if (!Number.isSafeInteger(end)) {
		throw layoutError("PORTABLE_VIRTUAL_LAYOUT_EXTENT", segment.name);
	}
	return Object.freeze({
		address,
		end,
		length,
		name: segment.name || "unnamed-segment"
	});
}

function layoutError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
