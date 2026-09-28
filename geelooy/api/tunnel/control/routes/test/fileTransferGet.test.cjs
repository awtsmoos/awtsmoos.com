// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const Policy = require("../../../../../apps/tunnel/agent/tools/fs/fileTransferPolicy.js");
const Get = require("../fileTransferGet.js");

/**
 * @file Freezes the pure-GET fallback grammar for agents without WebSockets.
 * @description The Awtsmoos lets a narrow HTTPS vessel share the same durable transfer truth;
 * Awtsmoos.com keeps upload fragments tiny, hashed, resumable, and scope-separated.
 */
test("GET action aliases map to the canonical transfer deeds", () => {
	assert.equal(Get.operationFor("source-info"), "fileTransferSourceInfo");
	assert.equal(Get.operationFor("source-proof"), "fileTransferSourceProof");
	assert.equal(Get.operationFor("read"), "fileTransferReadChunk");
	assert.equal(Get.operationFor("create"), "fileTransferCreate");
	assert.equal(Get.operationFor("status"), "fileTransferStatus");
	assert.equal(Get.operationFor("write"), "fileTransferWriteChunk");
	assert.equal(Get.operationFor("commit"), "fileTransferCommit");
	assert.equal(Get.operationFor("cancel"), "fileTransferCancel");
	assert.throws(() => Get.operationFor("shell"), /unknown_get_transfer_action/);
});

test("GET scope law keeps observations read-only and mutations write-scoped", () => {
	assert.equal(Get.permissionFor("fileTransferSourceProof"), "tunnel.read");
	assert.equal(Get.permissionFor("fileTransferReadChunk"), "tunnel.read");
	assert.equal(Get.permissionFor("fileTransferStatus"), "tunnel.read");
	assert.equal(Get.permissionFor("fileTransferCreate"), "tunnel.write");
	assert.equal(Get.permissionFor("fileTransferWriteChunk"), "tunnel.write");
	assert.equal(Get.permissionFor("fileTransferCommit"), "tunnel.write");
	assert.equal(Get.permissionFor("fileTransferCancel"), "tunnel.write");
});

test("GET upload fragments are capped at four KiB raw", () => {
	const allowed = crypto.randomBytes(Policy.GET_FALLBACK_UPLOAD_BYTES).toString("base64");
	assert.doesNotThrow(() => Get.assertGetPayload(allowed));
	const oversized = crypto.randomBytes(Policy.GET_FALLBACK_UPLOAD_BYTES + 1).toString("base64");
	assert.throws(() => Get.assertGetPayload(oversized), /get_transfer_chunk_too_large/);
});

test("GET payload builder preserves the same transferId used by WebSocket actions", () => {
	const transferId = "awtx_abcdefghijklmnopqrstuvwxyz012345";
	const payload = Get.payloadFor("fileTransferWriteChunk", {
		transfer_id: transferId,
		offset: "4096",
		content64: Buffer.from("B\"H").toString("base64"),
		sha256: crypto.createHash("sha256").update("B\"H").digest("hex")
	});
	assert.equal(payload.transferId, transferId);
	assert.equal(payload.offset, "4096");
	const read = Get.payloadFor("fileTransferReadChunk", { path: "movie.mp4", offset: "0" });
	assert.equal(read.maxBytes, Policy.GET_FALLBACK_READ_BYTES);
});
