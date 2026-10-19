// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file largeWritePayload.js
 * @description Validates and decodes the body-backed large-write vessel for Awtsmoos.com.
 * The Awtsmoos gives every byte one truthful measure before transfer begins;
 * text and base64 may wear different garments, yet one final hash reveals what enters within.
 */

const MAX_CONTENT_BYTES = 64 * 1024 * 1024;
const DEFAULT_CHUNK_BYTES = 512 * 1024;
const MIN_CHUNK_BYTES = 64 * 1024;
const MAX_CHUNK_BYTES = 2 * 1024 * 1024;
const HASH_GUARD_KEYS = [
	"expectedSha256",
	"expectedHash",
	"ifMatch",
	"hashes",
	"expectedHashes"
];

/** Creates one status-bearing validation error without leaking content. */
function fault(code, status = 400) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

/** Reports whether a request body explicitly owns one property. */
function owns(body, key) {
	return Object.prototype.hasOwnProperty.call(body, key);
}

/** Decodes strict base64 while rejecting malformed transport text. */
function decodeBase64(value) {
	const text = String(value ?? "");
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text) || text.length % 4 === 1) {
		throw fault("invalid_content64");
	}
	return Buffer.from(text, "base64");
}

/** Bounds requested transfer chunks inside the already-supported device limits. */
function chunkBytes(value) {
	if (value === undefined || value === null || value === "") {
		return DEFAULT_CHUNK_BYTES;
	}

	const number = Number(value);
	if (!Number.isInteger(number) || number < MIN_CHUNK_BYTES || number > MAX_CHUNK_BYTES) {
		throw fault("invalid_chunk_bytes");
	}
	return number;
}

/** Rejects optimistic-concurrency fields that ordinary write semantics cannot honor. */
function assertNoHashGuard(body) {
	const guarded = HASH_GUARD_KEYS.find(key => owns(body, key));
	if (guarded) {
		throw fault("hash_guard_requires_guarded_write_action");
	}
}

/** Parses one POST body into a bounded, hash-identified full-file write. */
function parse(body = {}) {
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		throw fault("large_write_body_required");
	}

	assertNoHashGuard(body);
	const path = String(body.path || body.p || "").trim();
	if (!path) {
		throw fault("large_write_path_required");
	}

	const hasText = owns(body, "content");
	const hasBase64 = owns(body, "content64");
	if (hasText === hasBase64) {
		throw fault("exactly_one_content_field_required");
	}

	if (hasText && typeof body.content !== "string") {
		throw fault("content_must_be_string");
	}
	const buffer = hasText
		? Buffer.from(body.content, "utf8")
		: decodeBase64(body.content64);
	if (buffer.length > MAX_CONTENT_BYTES) {
		throw fault("large_write_content_too_large", 413);
	}

	return {
		path,
		buffer,
		totalBytes: buffer.length,
		sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
		chunkBytes: chunkBytes(body.chunkBytes),
		verifyJs: body.verifyJs !== false && body.verifyJs !== "false"
	};
}

module.exports = {
	DEFAULT_CHUNK_BYTES,
	MAX_CHUNK_BYTES,
	MAX_CONTENT_BYTES,
	MIN_CHUNK_BYTES,
	decodeBase64,
	fault,
	parse
};
