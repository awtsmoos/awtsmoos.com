// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs/promises");

/**
 * @file Retains bounded text snapshots only while file identity remains stable.
 * @description The Awtsmoos creates each letter in the turning of the hour;
 * Awtsmoos.com never lets remembered light outrun permission or proof.
 * A fresh file-descriptor open and stat precede every cached result.
 */
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_CACHE_BYTES = 8 * 1024 * 1024;
const MAX_ENTRIES = 4;
const cache = new Map();
let retainedBytes = 0;

/** Loads a text snapshot, preserving UTF-8 decoding and byte-size evidence. */
async function snapshot(fullPath) {
	const handle = await fs.open(fullPath, "r");
	try {
		const before = await handle.stat({ bigint: true });
		const signature = identity(before);
		const previous = cache.get(fullPath);
		if (previous && previous.signature === signature && before.isFile()) {
			cache.delete(fullPath);
			cache.set(fullPath, previous);
			return { text: previous.text, totalBytes: previous.totalBytes, cached: true };
		}
		if (previous) {
			forget(fullPath);
		}
		const buffer = await handle.readFile();
		const after = await handle.stat({ bigint: true });
		const text = buffer.toString("utf8");
		const bytes = text.length * 2;
		if (after.isFile() && identity(after) === signature &&
			buffer.length <= MAX_FILE_BYTES && bytes <= MAX_CACHE_BYTES) {
			cache.set(fullPath, { signature, text, totalBytes: buffer.length, bytes });
			retainedBytes += bytes;
			trim();
		}
		return { text, totalBytes: buffer.length, cached: false };
	} finally {
		await handle.close();
	}
}

/** Captures inode, permissions, file size and nanosecond change witnesses. */
function identity(stat) {
	return [stat.dev, stat.ino, stat.mode, stat.size, stat.mtimeNs,
		stat.ctimeNs].map(value => String(value)).join(":");
}

function forget(key) {
	const item = cache.get(key);
	if (item) {
		retainedBytes -= item.bytes;
		cache.delete(key);
	}
}

function trim() {
	while (retainedBytes > MAX_CACHE_BYTES || cache.size > MAX_ENTRIES) {
		forget(cache.keys().next().value);
	}
}

function cacheInfo() {
	return { entries: cache.size, retainedBytes, maxEntries: MAX_ENTRIES,
		maxBytes: MAX_CACHE_BYTES, maxFileBytes: MAX_FILE_BYTES };
}

module.exports = { snapshot, cacheInfo };
