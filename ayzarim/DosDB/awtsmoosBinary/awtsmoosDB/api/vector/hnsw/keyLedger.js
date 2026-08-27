// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/hnsw/keyLedger.js
 * @chapter Thousands Of Vector Names Contract Into One Binary Seal
 * @description Encodes the complete HNSW key-to-node ledger in one deterministic
 * buffer and reads legacy Awtsmoos map ledgers for backward compatibility.
 */

const legacy = require('./keyMap.js');

const MAGIC = Buffer.from('HK01');
const HEADER_BYTES = 8;
const ENTRY_FIXED_BYTES = 8;

function encode(entries) {
	const normalized = Array.from(entries || []).map(([key, id]) => [
		Buffer.from(String(key), 'utf8'),
		Number(id)
	]);
	let size = HEADER_BYTES;
	for (const [key] of normalized) size += ENTRY_FIXED_BYTES + key.length;
	const output = Buffer.allocUnsafe(size);
	MAGIC.copy(output, 0);
	output.writeUInt32BE(normalized.length, 4);
	let offset = HEADER_BYTES;
	for (const [key, id] of normalized) {
		output.writeUInt32BE(key.length, offset);
		offset += 4;
		key.copy(output, offset);
		offset += key.length;
		output.writeUInt32BE(id, offset);
		offset += 4;
	}
	return output;
}

function entries(handle) {
	const buffer = normalizeBuffer(handle);
	return isPacked(buffer)
		? decode(buffer)
		: legacy.entries(handle);
}

function decode(buffer) {
	const count = buffer.readUInt32BE(4);
	const output = [];
	let offset = HEADER_BYTES;
	for (let index = 0; index < count; index++) {
		if (offset + ENTRY_FIXED_BYTES > buffer.length) {
			throw ledgerError('truncated entry header');
		}
		const keyLength = buffer.readUInt32BE(offset);
		offset += 4;
		if (offset + keyLength + 4 > buffer.length) {
			throw ledgerError('truncated key bytes');
		}
		const key = buffer.subarray(offset, offset + keyLength).toString('utf8');
		offset += keyLength;
		const id = buffer.readUInt32BE(offset);
		offset += 4;
		output.push([key, id]);
	}
	if (offset !== buffer.length) throw ledgerError('unexpected trailing bytes');
	return output;
}

function isPacked(value) {
	return Buffer.isBuffer(value)
		&& value.length >= HEADER_BYTES
		&& value.subarray(0, MAGIC.length).equals(MAGIC);
}

function normalizeBuffer(value) {
	if (Buffer.isBuffer(value)) return value;
	if (ArrayBuffer.isView(value)) {
		return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
	}
	return null;
}

function ledgerError(message) {
	const error = new Error(`B"H HNSW key ledger is invalid: ${message}`);
	error.code = 'AWTSMOOS_DB_VECTOR_KEY_LEDGER_INVALID';
	return error;
}

module.exports = {
	encode,
	entries,
	isPacked
};
