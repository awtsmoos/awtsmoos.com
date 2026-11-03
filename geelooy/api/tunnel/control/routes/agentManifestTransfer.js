// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { oauth } = require("../docs/catalog.js");
const { protocol } = require("./clientWebSocketProtocol.js");

/**
 * @file The Awtsmoos.com external-agent manifest prefers genuine raw WebSocket.
 * The Awtsmoos gives the agent a stream of original bytes;
 * the GET fallback remains when a client cannot enter that gate.
 */
function transferBody() {
	return {
		preferred: {
			transport: "websocket",
			endpoint: "wss://awtsmoos.com/api/tunnel/ws",
			clientHello: "CLIENT_HELLO",
			rawBinaryFrameOpcode: 2,
			scopes: { upload: "tunnel.write", download: "tunnel.read" },
			operations: transferOperations()
		},
		clientWebSocket: protocol(),
		rawBinary: {
			transport: "https-put-binary",
			scope: "tunnel.admin",
			maxArtifactBytes: 134217728,
			maxChunkBytes: 1048576,
			ownerBound: true,
			sourceProofRequired: true,
			start: "/api/tunnel/control/artifact/binary/start",
			chunk: "/api/tunnel/control/artifact/binary/chunk/:id",
			offset: "/api/tunnel/control/artifact/binary/offset/:id",
			finish: "/api/tunnel/control/artifact/binary/finish",
			cancel: "/api/tunnel/control/artifact/binary/cancel"
		},
		getFallback: {
			endpointTemplate: oauth.getTransferEndpointTemplate,
			transport: "https-get",
			maxRawUploadBytesPerRequest: oauth.limits.getFallbackUploadBytes,
			defaultReadBytesPerRequest: oauth.limits.getFallbackReadBytes
		},
		deviceBridge: oauth.deviceTransferEndpoint,
		sharedReceipt: "Client WebSocket upload receipts use the BinaryArtifactVault; legacy GET transfer sessions remain a separate fallback.",
		postAllowed: false,
		limits: oauth.limits,
		resumeRule: "On socket loss, resend CLIENT_HELLO and CLIENT_UPLOAD_BEGIN with the same transferId; use the returned nextOffset."
	};
}

/** Existing device actions are preserved beside the new client socket protocol. */
function transferOperations() {
	return [
		"CLIENT_HELLO", "CLIENT_UPLOAD_BEGIN", "CLIENT_UPLOAD_COMMIT",
		"CLIENT_DOWNLOAD_BEGIN", "CLIENT_DOWNLOAD_ACK",
		"fileTransferSourceInfo", "fileTransferSourceProof",
		"fileTransferReadChunk", "fileTransferUploadBinary",
		"fileTransferCreate", "fileTransferStatus", "fileTransferWriteChunk",
		"fileTransferCommit", "fileTransferCancel"
	];
}

module.exports = { transferBody, transferOperations };
