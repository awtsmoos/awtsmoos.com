// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Machine-readable OAuth-only raw WebSocket treaty for Awtsmoos.com.
 * The Awtsmoos creates the true byte, the owned route and the vessel;
 * the manifest cannot grant a power not verified by its own law.
 */
function protocol() {
	return {
		endpoint: "wss://awtsmoos.com/api/tunnel/ws",
		protocolVersion: "awtsmoos-tunnel-v3",
		clientId: "external-agent",
		defaultTransport: "websocket",
		fallbackTransport: "https-get",
		auth: "Authorization: Bearer <OAuth access token> in HTTP upgrade",
		noDeviceCredential: true,
		noTunnelAdminRequired: true,
		routeReference: "Immutable account-owned tunnelId from /api/tunnel/control/my-device",
		limits: {
			maxBinaryFrameBytes: 1048576, recommendedChunkBytes: 1048576,
			maxFileBytes: 134217728, windowChunks: 8, maxPendingFrames: 16,
			maxActivePerOwner: 2, maxActiveGlobal: 8,
			maxReservedOwnerBytes: 268435456,
			maxReservedGlobalBytes: 536870912
		},
		storage: {
			requiredServerEnv: "AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT",
			mustExist: true, absolutePath: true, minimumFreeBytes: 134217728,
			sameProcessResumeOnly: true,
			note: "Set on a private capacity-provisioned volume; never default to nearly full root."
		},
		messages: {
			CLIENT_HELLO: { fields: ["type", "protocolVersion", "clientId"], reply: "CLIENT_ACK" },
			CLIENT_ACK: { fields: ["type", "ok", "sessionId", "protocolVersion",
				"maxBinaryFrameBytes", "recommendedChunkBytes", "windowChunks", "heartbeatSeconds"] },
			CLIENT_UPLOAD_BEGIN: { fields: ["type", "routeReference", "destPath", "totalBytes",
				"sha256", "chunkBytes", "transferId?"], scope: "tunnel.write", reply: "UPLOAD_READY" },
			UPLOAD_READY: { fields: ["type", "transferId", "nextOffset", "chunkBytes", "windowChunks"] },
			UPLOAD_ACK: { fields: ["type", "transferId", "receivedBytes"] },
			CLIENT_UPLOAD_COMMIT: { fields: ["type", "transferId", "overwrite?"],
				scope: "tunnel.write", reply: "UPLOAD_COMMITTED" },
			UPLOAD_COMMITTED: { fields: ["type", "transferId", "path", "bytes", "sha256"] },
			CLIENT_DOWNLOAD_BEGIN: { fields: ["type", "routeReference", "sourcePath", "nextOffset?"],
				scope: "tunnel.read", reply: "DOWNLOAD_READY" },
			DOWNLOAD_READY: { fields: ["type", "transferId", "totalBytes", "sha256",
				"nextOffset", "chunkBytes"] },
			DOWNLOAD_CHUNK: { fields: ["type", "transferId", "offset", "bytes"],
				nextFrame: "One unencoded WebSocket opcode-2 payload of declared bytes" },
			CLIENT_DOWNLOAD_ACK: { fields: ["type", "transferId", "receivedBytes"], advisoryOnly: true },
			DOWNLOAD_COMPLETE: { fields: ["type", "transferId", "bytes", "sha256"] },
			PING: { fields: ["type"], reply: "PONG" },
			PONG: { fields: ["type", "at"] },
			CLIENT_ERROR: { fields: ["type", "ok", "code"] }
		},
		binary: {
			opcode: 2, maskingRequired: true, encodedAs: "raw bytes, not Base64",
			ackWindowChunks: 8, maxInFlightChunks: 16,
			overflow: "CLIENT_QUEUE_OVERFLOW closes the socket; reconnect using durable nextOffset",
			resumption: "Reconnect and resend CLIENT_HELLO and CLIENT_UPLOAD_BEGIN using the same transferId, owner, route, path, size, and SHA"
		},
		errors: ["AUTH_REQUIRED", "SCOPE_DENIED", "ROUTE_NOT_OWNED", "INVALID_CLIENT_HELLO",
			"CLIENT_HELLO_REQUIRED", "BAD_CLIENT_MESSAGE_TYPE", "INVALID_TRANSFER_MANIFEST",
			"TRANSFER_NOT_FOUND", "UPLOAD_NOT_STARTED", "INVALID_BINARY_CHUNK",
			"UPLOAD_SHA_MISMATCH", "DEVICE_SHA_MISMATCH", "DEVICE_OPERATION_FAILED",
			"DEVICE_OPERATION_DENIED", "DEVICE_RECEIPT_TIMEOUT", "CLIENT_QUEUE_OVERFLOW",
			"CLIENT_STORAGE_QUOTA", "CLIENT_STORAGE_NOT_CONFIGURED", "CLIENT_STORAGE_PATH_UNSAFE",
			"INVALID_SOURCE_PATH", "DEVICE_SOURCE_INVALID", "DEVICE_SOURCE_SHA_MISMATCH",
			"DOWNLOAD_SHA_MISMATCH", "CLIENT_BACKPRESSURE_TIMEOUT", "CLIENT_TRANSFER_FAILED"],
		heartbeatSeconds: 30,
		notes: "Upload resume is not guaranteed across a server restart; the device enforces destination path confinement and final SHA before atomic publication."
	};
}

module.exports = { protocol };
