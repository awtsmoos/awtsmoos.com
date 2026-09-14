//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDatabaseBoundedKeys
 * @description
 * Reads only the requested DosDB metadata window from disk when the binary vessel is
 * available. Generic databases retain a compatibility fallback, while native DosDB
 * pagination avoids materializing every collection key before slicing the response.
 */

const FileBuffer = require("../../DosDB/awtsmoosBinary/fileBuffer.js");
const OffsetBuffer = require("../../DosDB/awtsmoosBinary/awtsmoosBinaryJSON/offsetBuffer.js");
const objectReader = require("../../DosDB/awtsmoosBinary/awtsmoosBinaryJSON/deserialize/get.js");
const arrayReader = require("../../DosDB/awtsmoosBinary/awtsmoosBinaryJSON/deserialize/getArray.js");
const { unpackLength } = require("../../DosDB/awtsmoosBinary/awtsmoosBinaryJSON/packing/packedLength.js");
const unpackTypeAndLengthSize = require("../../DosDB/awtsmoosBinary/awtsmoosBinaryJSON/packing/unpackTypeAndLengthSize.js");

const MAX_BOUNDED_KEYS = 500;
const MAX_BOUNDED_OFFSET = 10000000;

/**
 * Lists a bounded key window with total-count and cursor testimony.
 * @param {object} database DosDB-compatible database.
 * @param {string} logicalPath Namespaced logical path.
 * @param {unknown} requestedLimit Requested maximum key count.
 * @param {unknown} requestedOffset Zero-based metadata offset.
 * @returns {Promise<object>} Bounded key page.
 */
async function listBoundedDatabaseKeys(database, logicalPath, requestedLimit, requestedOffset = 0) {
	const limit = boundedKeyLimit(requestedLimit);
	const offset = boundedKeyOffset(requestedOffset);
	if (typeof database?.ensureAwtsmoosBinaryPath === "function") {
		try {
			return await readBinaryKeys(database, logicalPath, limit, offset);
		} catch (_error) {
			// Compatibility databases may not use the legacy Awtsmoos binary vessel.
		}
	}
	return fallbackKeys(database, logicalPath, limit, offset);
}

/** @param {object} database DosDB instance. @param {string} logicalPath Path. @param {number} limit Bound. @param {number} offset Start. */
async function readBinaryKeys(database, logicalPath, limit, offset) {
	const physicalPath = await database.ensureAwtsmoosBinaryPath(logicalPath);
	const file = new FileBuffer(physicalPath);
	const table = objectReader.getMetadataTableInMainInfo(file);
	if (!table?.byteLength) return page([], 0, limit, offset, true);
	const metadata = new OffsetBuffer(file, table.offsetToStart, table.byteLength);
	const total = arrayReader.getLength(metadata);
	if (!Number.isInteger(total) || total < 0) throw new Error("Invalid DosDB metadata length");
	const keys = [];
	const end = Math.min(total, offset + limit);
	for (let index = Math.min(offset, total); index < end; index++) {
		const key = metadataEntryKey(arrayReader.getValueByIndex(metadata, index));
		if (key !== null) keys.push(key);
	}
	return page(keys, total, limit, offset, true);
}

/** @param {Buffer} entry Serialized metadata entry. @returns {string|null} Decoded key only. */
function metadataEntryKey(entry) {
	if (!Buffer.isBuffer(entry) || entry.length < 3) return null;
	const packed = entry.readUInt8(0);
	const keyLengthBytes = unpackLength((packed & 0b00001100) >> 2);
	const valueLengthBytes = unpackTypeAndLengthSize(entry.readUInt8(1)).lengthSize;
	if (!keyLengthBytes) return null;
	const keyLength = entry.readUIntBE(2, keyLengthBytes);
	const start = 2 + keyLengthBytes + valueLengthBytes;
	if (start + keyLength > entry.length) return null;
	return entry.subarray(start, start + keyLength).toString();
}

/** @param {object} database Generic DB. @param {string} path Path. @param {number} limit Bound. @param {number} offset Start. */
async function fallbackKeys(database, path, limit, offset) {
	const value = await database.getObjectKeys(path);
	const all = Array.isArray(value) ? value : Object.keys(value || {});
	return page(all.slice(offset, offset + limit), all.length, limit, offset, false);
}

/** @param {string[]} keys Keys. @param {number} total Total. @param {number} limit Limit. @param {number} offset Offset. @param {boolean} storageBounded Disk testimony. */
function page(keys, total, limit, offset, storageBounded) {
	const nextOffset = offset + keys.length < total ? offset + keys.length : null;
	const previousOffset = offset > 0 ? Math.max(0, offset - limit) : null;
	return { keys, total, limit, offset, nextOffset, previousOffset, truncated: offset > 0 || nextOffset !== null, storageBounded };
}

/** @param {unknown} value Requested limit. @returns {number} Safe key ceiling. */
function boundedKeyLimit(value) {
	const number = Number(value || MAX_BOUNDED_KEYS);
	return !Number.isFinite(number) || number < 1 ? MAX_BOUNDED_KEYS : Math.min(MAX_BOUNDED_KEYS, Math.floor(number));
}

/** @param {unknown} value Requested offset. @returns {number} Safe metadata offset. */
function boundedKeyOffset(value) {
	const number = Number(value || 0);
	return !Number.isFinite(number) || number < 0 ? 0 : Math.min(MAX_BOUNDED_OFFSET, Math.floor(number));
}

module.exports = { MAX_BOUNDED_KEYS, boundedKeyLimit, boundedKeyOffset, listBoundedDatabaseKeys, metadataEntryKey };
