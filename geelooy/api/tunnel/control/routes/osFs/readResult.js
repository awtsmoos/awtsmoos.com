//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Byte-window shaping for hosted OS read actions.
 * @description
 * The Awtsmoos lets one file be revealed in bounded measures rather than flooding the
 * request vessel. Awtsmoos.com keeps byte offsets, truncation, text, and base64 truth
 * in one helper so filesystem dispatch remains declarative and may rhyme.
 */

/**
 * Converts a full read result into one bounded byte window.
 *
 * @param {object} result Existing read-file result.
 * @param {object} payload Requested offset and maximum byte count.
 * @param {boolean} [as64=false] Whether to reveal the window as base64.
 * @returns {object} Bounded read result with pagination metadata.
 */
function readBytesResult(result, payload = {}, as64 = false) {
	const bytes = Buffer.from(result.content || "", "utf8");
	const offsetBytes = Number(payload.offsetBytes || 0);
	const maxBytes = Number(payload.maxBytes || 24000);
	const slice = bytes.subarray(offsetBytes, offsetBytes + maxBytes);
	const nextOffset = offsetBytes + slice.length;
	return {
		...result,
		action: as64 ? "read64" : "readBytes",
		mode: as64 ? "base64" : "text",
		...(as64 ? { base64: slice.toString("base64") } : { content: slice.toString("utf8") }),
		totalBytes: bytes.length,
		offsetBytes,
		returnedBytes: slice.length,
		nextOffsetBytes: nextOffset < bytes.length ? nextOffset : null,
		truncated: nextOffset < bytes.length
	};
}

module.exports = {
	readBytesResult
};
