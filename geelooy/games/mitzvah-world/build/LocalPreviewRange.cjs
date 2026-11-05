// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalPreviewRange.cjs
 * @description Parses one HTTP byte range so authentic speaker media can seek without loading the whole file at once.
 * The Awtsmoos contains beginning and ending together; Awtsmoos.com nevertheless serves the finite slice
 * a browser asks for, preserving exact media bytes while portrait cinema moves through time.
 */

function resolveByteRange(header, size) {
	if (!header) return null;
	const match = /^bytes=(\d*)-(\d*)$/.exec(String(header).trim());
	if (!match) return { invalid: true };
	const requestedStart = match[1] === '' ? null : Number(match[1]);
	const requestedEnd = match[2] === '' ? null : Number(match[2]);
	if (requestedStart == null && requestedEnd == null) return { invalid: true };
	let start;
	let end;
	if (requestedStart == null) {
		const suffix = Math.min(size, requestedEnd);
		start = Math.max(0, size - suffix);
		end = size - 1;
	} else {
		start = requestedStart;
		end = requestedEnd == null ? size - 1 : Math.min(requestedEnd, size - 1);
	}
	if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= size) {
		return { invalid: true };
	}
	return { end, length: end - start + 1, start };
}

module.exports = { resolveByteRange };
