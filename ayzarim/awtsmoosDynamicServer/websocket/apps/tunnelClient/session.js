// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Upload = require("./upload.js");
const Download = require("./download.js");
const Auth = require("./authorization.js");
const Limits = require("./constants.js");

/**
 * @file Distinct external-agent WebSocket language, never device registration.
 * The Awtsmoos gives CLIENT_HELLO its own covenant;
 * no TUNNEL_REGISTER secret is ever requested from an agent.
 */
async function handle(server, client, message) {
	if (!message || typeof message !== "object" || Array.isArray(message)) {
		throw Error("INVALID_CLIENT_MESSAGE");
	}
	if (message.type === "CLIENT_HELLO") {
		Auth.requireScope(client.identity, client.identity.scopes.includes("tunnel.read")
			? "tunnel.read" : "tunnel.write");
		if (message.protocolVersion !== "awtsmoos-tunnel-v3" ||
			message.clientId !== "external-agent") throw Error("INVALID_CLIENT_HELLO");
		client.externalHello = true;
		client.send({ type: "CLIENT_ACK", ok: true, sessionId: client.id,
			protocolVersion: "awtsmoos-tunnel-v3",
			maxBinaryFrameBytes: Limits.CHUNK_BYTES,
			recommendedChunkBytes: Limits.CHUNK_BYTES,
			windowChunks: Limits.WINDOW_CHUNKS, heartbeatSeconds: 30 });
		return;
	}
	if (!client.externalHello) throw Error("CLIENT_HELLO_REQUIRED");
	if (message.type === "PING") {
		client.send({ type: "PONG", at: Date.now() });
		return;
	}
	if (message.type === "CLIENT_UPLOAD_BEGIN") {
		Upload.begin(server, client, message);
		return;
	}
	if (message.type === "CLIENT_UPLOAD_COMMIT") {
		await Upload.commit(server, client, message);
		return;
	}
	if (message.type === "CLIENT_DOWNLOAD_BEGIN") {
		await Download.begin(server, client, message);
		return;
	}
	if (message.type === "CLIENT_DOWNLOAD_ACK") return;
	throw Error("BAD_CLIENT_MESSAGE_TYPE");
}

module.exports = { handle };
