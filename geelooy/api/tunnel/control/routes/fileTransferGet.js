// B"H
// Boruch Hashem
// Blessed is He

const Auth = require("../core/auth.js");
const { scopeAllowed } = require("../core/apiKeyStore.js");
const { json } = require("../core/respond.js");
const TransferPolicy = require("../../../../apps/tunnel/agent/tools/fs/fileTransferPolicy.js");
const DeviceTransfer = require("./deviceFileTransfer.js");

/**
 * @file Complete HTTPS-GET fallback for agents that cannot originate WebSockets.
 * @description The Awtsmoos lets a narrow river reach the same ocean: tiny GET upload fragments
 * enter the ordinary authenticated tunnel vessel, while durable manifests make transport changes
 * invisible to correctness. Status survives both mutable-response and wrapped-response routers.
 */
async function fileTransferGet($i, variables = {}) {
	if (($i.request?.method || "GET") !== "GET") {
		return routeJson($i, { BH: "B\"H", ok: false, error: "get_required", postAllowed: false }, 405);
	}
	const identity = Auth.currentIdentity($i);
	if (!identity.ok) return routeJson($i, { BH: "B\"H", ok: false, error: identity.error || "not_authenticated" }, 401);
	const query = Auth.query($i);
	try {
		const operation = operationFor(query.action || query.operation);
		const permission = permissionFor(operation);
		if (!scopeAllowed(identity, permission)) {
			return routeJson($i, { BH: "B\"H", ok: false, error: `${permission}_required` }, 403);
		}
		const payload = payloadFor(operation, query);
		const result = await DeviceTransfer.send($i, identity, variables.tunnelName, operation, permission, payload);
		return routeJson($i, {
			BH: "B\"H", ok: result?.ok !== false, ...result,
			externalTransport: "https-get", deviceTransport: "websocket", postAllowed: false
		});
	} catch (error) {
		return routeJson($i, { BH: "B\"H", ok: false, error: error.code || error.message || "get_transfer_failed" }, error.status || 400);
	}
}

function routeJson($i, data, status = 200) {
	if ($i?.response || $i?.res) return json($i, data, status);
	return { statusCode: status, mimeType: "application/json; charset=utf-8", body: JSON.stringify(data, null, 2) };
}
function operationFor(value) {
	const key = String(value || "").replace(/[^a-z]/gi, "").toLowerCase();
	const map = {
		sourceinfo: "fileTransferSourceInfo", sourceproof: "fileTransferSourceProof",
		read: "fileTransferReadChunk", readchunk: "fileTransferReadChunk",
		create: "fileTransferCreate", status: "fileTransferStatus",
		write: "fileTransferWriteChunk", writechunk: "fileTransferWriteChunk",
		commit: "fileTransferCommit", cancel: "fileTransferCancel"
	};
	if (!map[key]) throw TransferPolicy.fault("unknown_get_transfer_action");
	return map[key];
}
function permissionFor(operation) {
	return /Create|WriteChunk|Commit|Cancel/.test(operation) ? "tunnel.write" : "tunnel.read";
}
function payloadFor(operation, query = {}) {
	const payload = {
		path: query.path || query.p, transferId: query.transfer_id || query.transferId,
		offset: query.offset, maxBytes: query.max_bytes || query.maxBytes,
		totalBytes: query.total_bytes || query.totalBytes, sha256: query.sha256,
		expectedSha256: query.expected_sha256 || query.expectedSha256,
		chunkBytes: query.chunk_bytes || query.chunkBytes,
		overwrite: query.overwrite === true || query.overwrite === "true", content64: query.content64
	};
	if (operation === "fileTransferReadChunk" && !payload.maxBytes) payload.maxBytes = TransferPolicy.GET_FALLBACK_READ_BYTES;
	if (operation === "fileTransferWriteChunk") assertGetPayload(payload.content64);
	return payload;
}
function assertGetPayload(content64) {
	const text = String(content64 || "");
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(text)) throw TransferPolicy.fault("invalid_chunk_base64");
	TransferPolicy.assertGetUploadBytes(Buffer.from(text, "base64"));
}

module.exports = { assertGetPayload, fileTransferGet, operationFor, payloadFor, permissionFor, routeJson };
