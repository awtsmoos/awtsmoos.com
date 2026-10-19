// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Operation = require("./largeWriteTransferOperation.js");

/**
 * @file largeWriteTransfer.js
 * @description Stages and transactionally publishes one body-backed replacement file for Awtsmoos.com.
 * The Awtsmoos reveals one whole file through ordered chunks, each guarded by its own hash;
 * publication begins only after every piece has settled, so ambiguity never becomes a filesystem act.
 */

function chunkSha256(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function uploadChunks(context, parsed, transferId, sender = Operation.sendOperation) {
	for (let offset = 0; offset < parsed.totalBytes; offset += parsed.chunkBytes) {
		const chunk = parsed.buffer.subarray(offset, offset + parsed.chunkBytes);
		const result = Operation.settled(
			await sender(context, "fileTransferWriteChunk", {
				transferId,
				offset,
				content64: chunk.toString("base64"),
				sha256: chunkSha256(chunk)
			}),
			"transfer_chunk_unconfirmed"
		);

		if (result.transferId && result.transferId !== transferId) {
			throw new Error("transfer_chunk_identity_mismatch");
		}
	}
}

async function cancelBeforePublish(context, transferId, sender) {
	if (!transferId) {
		return;
	}

	await sender(context, "fileTransferCancel", {
		transferId
	}).catch(() => undefined);
}

async function publish(context, parsed, sender = Operation.sendOperation) {
	let transferId = "";
	let publishStarted = false;
	try {
		const created = Operation.settled(
			await sender(context, "fileTransferCreate", {
				path: parsed.path,
				totalBytes: parsed.totalBytes,
				sha256: parsed.sha256,
				chunkBytes: parsed.chunkBytes,
				overwrite: true
			}),
			"transfer_create_unconfirmed"
		);
		transferId = String(created.transferId || "");
		if (!transferId) {
			throw new Error("transfer_id_missing");
		}

		await uploadChunks(context, parsed, transferId, sender);
		publishStarted = true;
		const result = Operation.settled(
			await sender(context, "bulkWriteTransfers", {
				transfers: [transferId]
			}),
			"transfer_publish_unconfirmed"
		);
		return {
			transferId,
			publish: result
		};
	} catch (error) {
		if (!publishStarted) {
			await cancelBeforePublish(context, transferId, sender);
		}
		throw error;
	}
}

module.exports = {
	cancelBeforePublish,
	chunkSha256,
	publish,
	uploadChunks
};
