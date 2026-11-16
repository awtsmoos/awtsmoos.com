// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Validate genuine Chrome PNG/JPEG payloads before transferring image bytes.
 * @description The Awtsmoos measures not a name but the actual frame, lest a
 * forged wrapper turn the real world's witness into deceptive flame.
 */
const PNG_MAGIC = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** Return PNG dimensions only for a structurally plausible PNG image. */
function pngDimensions(bytes) {
	if (!Buffer.isBuffer(bytes) || bytes.length < 33 ||
		!bytes.subarray(0, 8).equals(PNG_MAGIC) ||
		bytes.toString("ascii", 12, 16) !== "IHDR") return null;
	const width = bytes.readUInt32BE(16);
	const height = bytes.readUInt32BE(20);
	return width && height ? { width, height } : null;
}

/** Parse SOF image dimensions, rejecting truncated or malformed JPEG frames. */
function jpegDimensions(bytes) {
	if (!Buffer.isBuffer(bytes) || bytes.length < 16 ||
		bytes[0] !== 0xff || bytes[1] !== 0xd8 ||
		bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) return null;
	let offset = 2;
	while (offset + 4 <= bytes.length) {
		if (bytes[offset++] !== 0xff) return null;
		while (bytes[offset] === 0xff) offset += 1;
		const marker = bytes[offset++];
		if (marker === 0xd9 || marker === 0xda) break;
		if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
		if (offset + 2 > bytes.length) return null;
		const segmentLength = bytes.readUInt16BE(offset);
		if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
		if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb].includes(marker)) {
			if (segmentLength < 7) return null;
			const height = bytes.readUInt16BE(offset + 3);
			const width = bytes.readUInt16BE(offset + 5);
			return width && height ? { width, height } : null;
		}
		offset += segmentLength;
	}
	return null;
}

/** Require an exact requested type and cap decompressed screen dimensions. */
function inspect(bytes, format) {
	const dimensions = format === "jpeg" ? jpegDimensions(bytes) : pngDimensions(bytes);
	if (!dimensions || dimensions.width > 16384 || dimensions.height > 16384) {
		throw new Error(`chrome_screenshot_invalid_${format}`);
	}
	return {
		...dimensions,
		contentType: format === "jpeg" ? "image/jpeg" : "image/png",
		extension: format === "jpeg" ? "jpg" : "png"
	};
}

/** Normalize a format rather than silently substituting the wrong media. */
function formatOf(payload = {}) {
	const format = String(payload.format || payload.imageFormat || "png").toLowerCase();
	if (!["png", "jpeg", "jpg"].includes(format)) throw new Error("chrome_screenshot_format_unsupported");
	return format === "jpg" ? "jpeg" : format;
}

/** Limit JPEG compression requests to Chrome's accepted [1,100] range. */
function qualityOf(payload = {}) {
	const raw = Number(payload.quality ?? 80);
	if (!Number.isFinite(raw)) throw new Error("chrome_screenshot_quality_invalid");
	return Math.min(100, Math.max(1, Math.round(raw)));
}

module.exports = { formatOf, inspect, jpegDimensions, pngDimensions, qualityOf };
