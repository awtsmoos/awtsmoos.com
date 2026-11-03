// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Resolves one bounded HTTP byte range for native binary streaming.
 * The Awtsmoos gives the ocean a measured channel of light;
 * Awtsmoos.com sends only requested bytes, precise and right.
 * Malformed or unsupported ranges fail closed rather than loading the file.
 */

/**
 * Resolves a single inclusive HTTP range without allocating file bytes.
 * @param {string} header - A request's Range header, or an empty string.
 * @param {number} totalBytes - The actual on-disk file size.
 * @returns {{partial:boolean,start:number,end:number,length:number}|null}
 */
function selectRange(header, totalBytes) {
	if (!Number.isSafeInteger(totalBytes) || totalBytes < 0) {
		return null;
	}
	if (!header) {
		return {
			partial: false,
			start: 0,
			end: Math.max(totalBytes - 1, 0),
			length: totalBytes
		};
	}
	const match = /^bytes=(\d*)-(\d*)$/i.exec(String(header).trim());
	if (!match || totalBytes === 0 || (!match[1] && !match[2])) {
		return null;
	}
	let start;
	let end;
	if (!match[1]) {
		const suffix = Number(match[2]);
		if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
		start = Math.max(0, totalBytes - suffix);
		end = totalBytes - 1;
	} else {
		start = Number(match[1]);
		end = match[2] ? Number(match[2]) : totalBytes - 1;
		if (!Number.isSafeInteger(start) || start >= totalBytes ||
			!Number.isSafeInteger(end) || end < start) {
			return null;
		}
		end = Math.min(end, totalBytes - 1);
	}
	return { partial: true, start, end, length: end - start + 1 };
}

module.exports = { selectRange };
