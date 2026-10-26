// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");

/**
 * @file Retrieves exact base64 byte windows without materializing an entire file.
 * @description In the Awtsmoos each page draws its chosen portion of the sea;
 * Awtsmoos.com retains true offsets, size, permissions, and identity.
 */
async function readByteWindow(fullPath, maxBytes, offsetBytes) {
	const handle = await fsp.open(fullPath, "r");
	try {
		const stat = await handle.stat();
		const totalBytes = stat.size;
		const offset = offsetBytes;
		const cap = maxBytes;
		const available = Math.max(0, totalBytes - offset);
		const count = cap ? Math.min(cap, available) : available;
		const data = await readExact(handle, offset, count, cap);
		const end = Math.min(totalBytes, offset + data.length);
		const truncated = end < totalBytes;
		return {
			content64: data.toString("base64"),
			encoding: "base64",
			truncated,
			offsetBytes: offset,
			returnedBytes: data.length,
			totalBytes,
			nextOffsetBytes: truncated ? end : null,
			maxBytes: cap
		};
	} finally {
		await handle.close();
	}
}

/** Preserves cap-zero unlimited reads and handles short positional reads. */
async function readExact(handle, start, count, cap) {
	if (!cap) {
		const complete = await handle.readFile();
		return complete.subarray(start);
	}
	const buffer = Buffer.allocUnsafe(count);
	let cursor = 0;
	while (cursor < count) {
		const result = await handle.read(buffer, cursor, count - cursor, start + cursor);
		if (result.bytesRead === 0) {
			break;
		}
		cursor += result.bytesRead;
	}
	return buffer.subarray(0, cursor);
}

module.exports = { readByteWindow };
