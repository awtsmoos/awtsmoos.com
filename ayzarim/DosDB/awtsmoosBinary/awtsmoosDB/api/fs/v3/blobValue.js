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
	const compressed = db.blob.read(blob, 0, Number(blob.length || 0));
	const output = zlib.inflateRawSync(compressed);
	const expected = Number(metadata.originalBytes ?? inode.size ?? output.length);
	if (output.length !== expected) {
		const error = new Error(`B"H FS3 length mismatch: ${output.length} !== ${expected}`);
		error.code = 'AWTSMOOS_FS3_DECOMPRESSION_LENGTH_MISMATCH';
		throw error;
	}
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
	encodeBody,
	freeDataRecord,
	makeDataRecord,
	readDataRecord,
	replaceDataRecord,
	toBuffer
};