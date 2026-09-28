// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const DEFAULT_CHUNK_BYTES = 1024 * 1024;
const MAX_CHUNK_BYTES = 2 * 1024 * 1024;
const MIN_CHUNK_BYTES = 64 * 1024;
const GET_FALLBACK_UPLOAD_BYTES = 4 * 1024;
const GET_FALLBACK_READ_BYTES = 64 * 1024;
const MAX_FILE_BYTES = 1024 * 1024 * 1024 * 1024;
const ID_PATTERN = /^awtx_[A-Za-z0-9_-]{20,96}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

/**
 * @file Bounded law for resumable WebSocket and HTTPS-GET file transfer.
 * @description The Awtsmoos lets enormous files cross through small truthful vessels;
 * Awtsmoos.com prefers wide WebSocket fragments yet keeps a tiny GET fallback for agents
 * that cannot open sockets, without changing the durable transfer manifest beneath them.
 */
function transferId() {
	return `awtx_${crypto.randomBytes(24).toString("base64url")}`;
}
function id(value) {
	const text = String(value || "");
	if (!ID_PATTERN.test(text)) throw fault("invalid_transfer_id");
	return text;
}
function sha256(value, required = true) {
	const text = String(value || "").toLowerCase();
	if (!text && !required) return "";
	if (!SHA256_PATTERN.test(text)) throw fault("invalid_sha256");
	return text;
}
function chunkBytes(value) {
	const bytes = Number(value || DEFAULT_CHUNK_BYTES);
	if (!Number.isInteger(bytes) || bytes < MIN_CHUNK_BYTES || bytes > MAX_CHUNK_BYTES) {
		throw fault("invalid_chunk_bytes");
	}
	return bytes;
}
function totalBytes(value) {
	const bytes = Number(value);
	if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > MAX_FILE_BYTES) {
		throw fault("invalid_total_bytes");
	}
	return bytes;
}
function offset(value, total) {
	const number = Number(value || 0);
	if (!Number.isSafeInteger(number) || number < 0 || number > total) throw fault("invalid_chunk_offset");
	return number;
}
function assertGetUploadBytes(buffer) {
	if (!Buffer.isBuffer(buffer) || buffer.length > GET_FALLBACK_UPLOAD_BYTES) {
		throw fault("get_transfer_chunk_too_large");
	}
	return buffer;
}
function fault(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	DEFAULT_CHUNK_BYTES,
	GET_FALLBACK_READ_BYTES,
	GET_FALLBACK_UPLOAD_BYTES,
	MAX_CHUNK_BYTES,
	MAX_FILE_BYTES,
	MIN_CHUNK_BYTES,
	assertGetUploadBytes,
	chunkBytes,
	fault,
	id,
	offset,
	sha256,
	totalBytes,
	transferId
};
