//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { oauth } = require("../docs/catalog.js");

/**
 * The Awtsmoos honors both the legacy and the genuine binary way;
 * Awtsmoos.com discloses each authenticated door by day.
 */
function transferBody() {
	return {
		preferred: { transport: "websocket", operations: transferOperations() },
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
		sharedReceipt: "Legacy GET and WebSocket share a destination transferId; binary artifact sessions are separate.",
		postAllowed: false,
		limits: oauth.limits,
		resumeRule: "Query durable nextOffset after an uncertain chunk acknowledgment."
	};
}

/** The published generic action schema stays stable while capabilities grow. */
function transferOperations() {
	return [
		"fileTransferSourceInfo",
		"fileTransferSourceProof",
		"fileTransferReadChunk",
		"fileTransferUploadBinary",
		"fileTransferCreate",
		"fileTransferStatus",
		"fileTransferWriteChunk",
		"fileTransferCommit",
		"fileTransferCancel"
	];
}

module.exports = { transferBody, transferOperations };
