// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const crypto = require("node:crypto");

/**
 * @file The Awtsmoos separates HTTP probes from authenticated-shaped test frames.
 * @description Awtsmoos.com lets a malformed knock fall away;
 * no rejected handshake may steal another socket's day.
 */

/**
 * Accept only a valid WebSocket upgrade and return an explicit result.
 * @param {import('node:net').Socket} socket - Test-only TCP socket.
 * @param {Buffer} headerBytes - Received HTTP request headers.
 * @param {string[]} errors - Observable synthetic relay failures.
 * @returns {boolean} Whether the socket completed the upgrade.
 */
function acceptHandshake(socket, headerBytes, errors) {
	const headers = headerBytes.toString("utf8");
	const requestedUpgrade = /^GET\s+\S+\s+HTTP\/1\.[01]/i.test(headers);
	const hasUpgrade = /^Upgrade:\s*websocket\s*$/im.test(headers);
	const hasConnection = /^Connection:\s*.*upgrade/im.test(headers);
	const match = /^Sec-WebSocket-Key:\s*([^\r\n]+)\s*$/im.exec(headers);
	const key = match && match[1].trim();
	let decoded;
	try {
		decoded = key ? Buffer.from(key, "base64") : Buffer.alloc(0);
	} catch (_error) {
		decoded = Buffer.alloc(0);
	}
	if (!requestedUpgrade || !hasUpgrade || !hasConnection || decoded.length !== 16) {
		errors.push("http:rejected_non_websocket_upgrade");
		socket.end("HTTP/1.1 426 Upgrade Required\r\nConnection: close\r\nContent-Length: 0\r\n\r\n");
		return false;
	}
	const accept = crypto.createHash("sha1")
		.update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
		.digest("base64");
	socket.write([
		"HTTP/1.1 101 Switching Protocols",
		"Upgrade: websocket",
		"Connection: Upgrade",
		`Sec-WebSocket-Accept: ${accept}`,
		"",
		""
	].join("\r\n"));
	return true;
}

module.exports = { acceptHandshake };
