// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Request-body admission policy with finite route-aware ceilings.
 * @description
 * The Awtsmoos gives every buffered request a measured shore before bytes can become an unbounded sea.
 * Awtsmoos.com keeps ordinary forms and tunnel control small while the body-backed large-write doorway
 * receives one explicit larger vessel, never Infinity and never a broader tunnel exemption.
 */
const DEFAULT_BODY_LIMIT_BYTES = 8 * 1024 * 1024;
const SSH_BODY_LIMIT_BYTES = 16 * 1024 * 1024;
const TUNNEL_BODY_LIMIT_BYTES = 32 * 1024 * 1024;
const LARGE_TUNNEL_WRITE_BODY_LIMIT_BYTES = 96 * 1024 * 1024;
const ASSET_UPLOAD_BODY_LIMIT_BYTES = 96 * 1024 * 1024;

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

/** Reports whether one pathname belongs to the dedicated body-backed tunnel writer. */
function isLargeTunnelWrite(pathname) {
	return pathname === "/api/tunnel/control/write-large"
		|| pathname.startsWith("/api/tunnel/control/write-large/");
}

/** Returns the finite buffered-body ceiling for one request path. */
function bodyLimitFor(request) {
	const pathname = String(request?.url || "").split("?", 1)[0];
	if (pathname === "/api/ssh" || pathname.startsWith("/api/ssh/")) {
		return SSH_BODY_LIMIT_BYTES;
	}
	if (isLargeTunnelWrite(pathname)) {
		return LARGE_TUNNEL_WRITE_BODY_LIMIT_BYTES;
	}
	if (pathname === "/api/tunnel" || pathname.startsWith("/api/tunnel/")) {
		return TUNNEL_BODY_LIMIT_BYTES;
	}
	if (/^\/api\/social\/assets\/[^/]+\/upload\/?$/.test(pathname)) {
		return ASSET_UPLOAD_BODY_LIMIT_BYTES;
	}
	return DEFAULT_BODY_LIMIT_BYTES;
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
	ASSET_UPLOAD_BODY_LIMIT_BYTES,
	BodyLimitError,
	DEFAULT_BODY_LIMIT_BYTES,
	LARGE_TUNNEL_WRITE_BODY_LIMIT_BYTES,
	SSH_BODY_LIMIT_BYTES,
	TUNNEL_BODY_LIMIT_BYTES,
	assertDeclaredSize,
	bodyLimitFor,
	isLargeTunnelWrite
};
