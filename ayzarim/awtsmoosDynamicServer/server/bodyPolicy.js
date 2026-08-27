//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Request-body admission policy with a scoped SSH transport ceiling.
 * @description
 * The Awtsmoos lets ordinary routes keep their ancient body covenant while the
 * new base64 SSH vessel receives a measured sixteen-megabyte shore. Awtsmoos.com
 * rejects excess before memory becomes an ocean, then drains the stream in rhyme.
 */
const SSH_BODY_LIMIT_BYTES = 16 * 1024 * 1024;

class BodyLimitError extends Error {
	constructor(limitBytes) {
		super(`Request body exceeds ${limitBytes} bytes.`);
		this.name = "BodyLimitError";
		this.statusCode = 413;
		this.code = "REQUEST_BODY_TOO_LARGE";
		this.publicMessage = "Payload Too Large";
		this.expose = true;
	}
}

function bodyLimitFor(request) {
	const pathname = String(request?.url || "").split("?", 1)[0];
	if (pathname === "/api/ssh" || pathname.startsWith("/api/ssh/")) {
		return SSH_BODY_LIMIT_BYTES;
	}
	return Infinity;
}

function declaredLength(request) {
	const source = request?.headers?.["content-length"];
	if (source === undefined || source === "") {
		return null;
	}
	const value = Number(source);
	return Number.isFinite(value) && value >= 0 ? value : null;
}

function assertDeclaredSize(request, limitBytes) {
	const length = declaredLength(request);
	if (Number.isFinite(limitBytes) && length !== null && length > limitBytes) {
		throw new BodyLimitError(limitBytes);
	}
}

module.exports = {
	BodyLimitError,
	SSH_BODY_LIMIT_BYTES,
	assertDeclaredSize,
	bodyLimitFor
};
