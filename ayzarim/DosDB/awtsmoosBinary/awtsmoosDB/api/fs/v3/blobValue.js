// B"H

/**
 * @file blobValue.js
 * @chapter The Same Letter Wears A Smaller Garment
 * @description
 * FS3 stores exact logical bytes while choosing a compact physical vessel. Legacy
 * identity blobs remain readable. New bodies use deflate-raw only when compression
 * saves meaningful space, and every read validates the revealed original length.
 */

const zlib = require('zlib');

const CODEC = 'deflate-raw-v1';
const MINIMUM_BYTES = 256;
const MINIMUM_SAVINGS = 32;
const DEFAULT_MAX_DECOMPRESSED_BYTES = 256 * 1024 * 1024;
const DEFAULT_CACHE_BYTES = 256 * 1024 * 1024;
const decodedCaches = new WeakMap();

function toBuffer(value) {
	if (Buffer.isBuffer(value)) return value;
	if (value instanceof Uint8Array) return Buffer.from(value);
	if (value === undefined || value === null) return Buffer.alloc(0);
	if (typeof value === 'string') return Buffer.from(value, 'utf8');
	return Buffer.from(JSON.stringify(value), 'utf8');
}

function plain(value) {
	return value && value.__resolve__ ? value.__resolve__() : value;
}

function metadataOf(blob) {
	return plain(blob && blob.meta) || {};
}

function positiveLimit(value, fallback) {
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function decompressionLimits(db) {
	return {
		maxOutputBytes: positiveLimit(
			db.options?.virtualFsMaxDecompressedBytes,
			DEFAULT_MAX_DECOMPRESSED_BYTES
		),
		maxCacheBytes: positiveLimit(
			db.options?.virtualFsDecompressionCacheBytes,
			DEFAULT_CACHE_BYTES
		)
	};
}

function cacheFor(db) {
	let cache = decodedCaches.get(db);
	if (!cache) {
		cache = { bytes: 0, entries: new Map() };
		decodedCaches.set(db, cache);
	}
	return cache;
}

function cacheKey(blob, metadata, expected) {
	return [
		String(blob.id || ''),
		Number(blob.offset || 0),
		Number(blob.length || 0),
		String(metadata.fs3Codec || ''),
		expected
	].join(':');
}

function cachedDecodedBody(db, key) {
	const cache = cacheFor(db);
	const output = cache.entries.get(key);
	if (!output) return null;
	cache.entries.delete(key);
	cache.entries.set(key, output);
	return output;
}

function rememberDecodedBody(db, key, output, maxCacheBytes) {
	if (output.length > maxCacheBytes) return;
	const cache = cacheFor(db);
	const previous = cache.entries.get(key);
	if (previous) cache.bytes -= previous.length;
	cache.entries.delete(key);
	cache.entries.set(key, output);
	cache.bytes += output.length;
	while (cache.bytes > maxCacheBytes && cache.entries.size > 1) {
		const oldestKey = cache.entries.keys().next().value;
		const oldest = cache.entries.get(oldestKey);
		cache.entries.delete(oldestKey);
		cache.bytes -= oldest.length;
	}
}

function encodeBody(db, buffer) {
	if (db.options?.virtualFsCompression === false || buffer.length < MINIMUM_BYTES) {
		return { bytes: buffer, metadata: {} };
	}
	const compressed = zlib.deflateRawSync(buffer, { level: 6 });
	if (compressed.length + MINIMUM_SAVINGS >= buffer.length) {
		return { bytes: buffer, metadata: {} };
	}
	return {
		bytes: compressed,
		metadata: {
			fs3Codec: CODEC,
			originalBytes: buffer.length,
			storedBytes: compressed.length
		}
	};
}

function makeDataRecord(db, value, meta = {}) {
	const buffer = toBuffer(value);
	const encoded = encodeBody(db, buffer);
	const data = db.blob.create(encoded.bytes, { ...meta, ...encoded.metadata });
	return { kind: 'blob', data, size: buffer.length };
}

function freeDataRecord(db, inode) {
	const data = plain(inode && inode.data);
	if (!inode || inode.dataKind !== 'blob' || !data || data.__awtsmoosBlob !== true) {
		return false;
	}
	db.blob.delete(data);
	return true;
}

function decodedBody(db, inode) {
	const blob = plain(inode && inode.data);
	const metadata = metadataOf(blob);
	if (!blob || blob.__awtsmoosBlob !== true) return Buffer.alloc(0);
	if (!metadata.fs3Codec) return null;
	if (metadata.fs3Codec !== CODEC) {
		const error = new Error(`B"H unsupported FS3 codec: ${metadata.fs3Codec}`);
		error.code = 'AWTSMOOS_FS3_UNSUPPORTED_CODEC';
		throw error;
	}
	const expected = Number(metadata.originalBytes ?? inode.size);
	const { maxOutputBytes, maxCacheBytes } = decompressionLimits(db);
	if (!Number.isSafeInteger(expected) || expected < 0 || expected > maxOutputBytes) {
		const error = new Error(`B"H FS3 decompressed length refused: ${expected}`);
		error.code = 'AWTSMOOS_FS3_DECOMPRESSION_LIMIT';
		throw error;
	}
	const key = cacheKey(blob, metadata, expected);
	const cached = cachedDecodedBody(db, key);
	if (cached) return cached;
	const compressed = db.blob.read(blob, 0, Number(blob.length || 0));
	let output;
	try {
		output = zlib.inflateRawSync(compressed, {
			maxOutputLength: Math.max(1, expected)
		});
	} catch (cause) {
		const error = new Error(`B"H FS3 decompression failed within ${expected} bytes`);
		error.code = cause?.code === 'ERR_BUFFER_TOO_LARGE'
			? 'AWTSMOOS_FS3_DECOMPRESSION_LIMIT'
			: 'AWTSMOOS_FS3_DECOMPRESSION_FAILED';
		error.cause = cause;
		throw error;
	}
	if (output.length !== expected) {
		const error = new Error(`B"H FS3 length mismatch: ${output.length} !== ${expected}`);
		error.code = 'AWTSMOOS_FS3_DECOMPRESSION_LENGTH_MISMATCH';
		throw error;
	}
	rememberDecodedBody(db, key, output, maxCacheBytes);
	return output;
}

function readDataRecord(db, inode, offset = 0, length) {
	const start = Math.max(0, offset || 0);
	const wanted = length === undefined ? inode.size - start : Math.max(0, length);
	const decoded = decodedBody(db, inode);
	if (decoded) return decoded.subarray(start, start + wanted);
	return db.blob.read(plain(inode.data), start, wanted);
}

function replaceDataRecord(db, inode, value, meta = {}) {
	const previousKind = inode.dataKind;
	const previousData = inode.data;
	const record = makeDataRecord(db, value, meta);
	inode.dataKind = record.kind;
	inode.data = record.data;
	inode.size = record.size;
	inode.mtime = Date.now();
	inode.version = (inode.version || 0) + 1;
	if (previousKind === 'blob') {
		freeDataRecord(db, { dataKind: previousKind, data: previousData });
	}
	return inode;
}

module.exports = {
	CODEC,
	decodedBody,
	decompressionLimits,
	encodeBody,
	freeDataRecord,
	makeDataRecord,
	readDataRecord,
	replaceDataRecord,
	toBuffer
};
