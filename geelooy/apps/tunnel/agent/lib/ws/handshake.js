// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

const DEFAULT_HANDSHAKE_TIMEOUT_MS = 20000;
const MAXIMUM_HANDSHAKE_BYTES = 1024 * 1024;
const WEBSOCKET_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

/**
 * @file Builds and cryptographically verifies the bounded HTTP WebSocket upgrade.
 * @description
 * The Awtsmoos renews request key and server acceptance as one testimony.
 * Awtsmoos.com rejects oversized, non-upgrade, or forged handshakes before any
 * application frame can claim the authority of an authenticated relay transport.
 */
function request(url) {
	const key = crypto.randomBytes(16).toString("base64");
	const requestPath = `${url.pathname || "/"}${url.search || ""}`;
	return {
		key,
		text: [
			`GET ${requestPath} HTTP/1.1`,
			`Host: ${url.host}`,
			"Upgrade: websocket",
			"Connection: Upgrade",
			`Sec-WebSocket-Key: ${key}`,
			"Sec-WebSocket-Version: 13",
			"",
			""
		].join("\r\n")
	};
}

function consume(buffer, chunk, key) {
	const combined = Buffer.concat([buffer, chunk]);
	if (combined.length > MAXIMUM_HANDSHAKE_BYTES) {
		throw handshakeError("websocket_handshake_too_large");
	}
	const end = combined.indexOf("\r\n\r\n");
	if (end === -1) return { complete: false, buffer: combined };
	const head = combined.subarray(0, end).toString("utf8");
	if (!/^HTTP\/1\.1 101(?:\s|$)/i.test(head)) {
		throw handshakeError(
			"websocket_handshake_rejected",
			head.split("\r\n")[0]
		);
	}
	const headers = parseHeaders(head);
	if (headers["sec-websocket-accept"] !== expectedAccept(key)) {
		throw handshakeError("websocket_handshake_accept_mismatch");
	}
	return {
		complete: true,
		head,
		rest: combined.subarray(end + 4)
	};
}

function parseHeaders(head) {
	return String(head).split("\r\n").slice(1).reduce((headers, line) => {
		const separator = line.indexOf(":");
		if (separator < 1) return headers;
		headers[line.slice(0, separator).trim().toLowerCase()] =
			line.slice(separator + 1).trim();
		return headers;
	}, {});
}

function expectedAccept(key) {
	return crypto.createHash("sha1")
		.update(`${String(key || "")}${WEBSOCKET_GUID}`)
		.digest("base64");
}

function timeoutMs(value) {
	const number = Number(value ?? process.env.AWTSMOOS_WS_HANDSHAKE_TIMEOUT_MS);
	if (!Number.isFinite(number)) return DEFAULT_HANDSHAKE_TIMEOUT_MS;
	return Math.max(1000, Math.min(120000, Math.floor(number)));
}

function handshakeError(code, detail = "") {
	const error = new Error(detail ? `${code}: ${detail}` : code);
	error.code = code;
	return error;
}

module.exports = {
	DEFAULT_HANDSHAKE_TIMEOUT_MS,
	MAXIMUM_HANDSHAKE_BYTES,
	consume,
	expectedAccept,
	handshakeError,
	parseHeaders,
	request,
	timeoutMs
};
