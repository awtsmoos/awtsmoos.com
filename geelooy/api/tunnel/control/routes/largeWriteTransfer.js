// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const Policy = require("./protectedFsPolicy.js");
const Scheduler = require("./protectedFsSchedulerIdentity.js");

/**
 * @file largeWriteTransfer.js
 * @description Moves one body-backed file through the verified Awtsmoos.com transfer covenant.
 * The Awtsmoos gives each chunk a measured hash and each action a fresh identity;
 * no later step may begin while an earlier control deed remains only a pending possibility.
 */

/** Creates a fresh internal files-operation payload without reusing outer mutation identity. */
function operationPayload(context, operation, params = {}) {
	const base = {
		...context.payload
	};
	for (const key of [
		"action",
		"clientRequestId",
		"content",
		"content64",
		"controlRequestId",
		"nonce",
		"originalControlRequestId",
		"requestId"
	]) {
		delete base[key];
	}

	return Scheduler.attach({
		...base,
		action: "files",
		operation,
		...params,
		autoPreview: false
	}, context.identity, context.tunnelName);
}

/** Sends one authenticated internal transfer operation through the ordinary tunnel vessel. */
async function sendOperation(context, operation, params = {}) {
	const payload = operationPayload(context, operation, params);
	const vessel = resolveFsVessel({
		$i: context.$i,
		identity: context.identity,
		tunnelName: context.tunnelName,
		payload,
		permission: context.permission,
		timeoutMs: Policy.boundedTunnelTimeout(
			context.payload.timeoutMs || context.payload.timeout
		)
	});

	if (!vessel?.ok) {
		const error = new Error(vessel?.body?.error || vessel?.error || "device_route_unavailable");
		error.status = vessel?.status || 409;
		throw error;
	}

	return vessel.send();
}

/** Refuses to advance after an ambiguous or failed internal mutation receipt. */
function settled(result, code) {
	if (!result || result.ok === false || result.pending === true || result.action === "tunnelRequestPending") {
		const error = new Error(code);
		error.status = Number(result?.status || 409);
		error.details = result || null;
		throw error;
	}
	return result;
}

/** Returns the SHA-256 identity for one decoded chunk. */
function chunkSha256(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}

/** Uploads every chunk in order and requires each write to settle before continuing. */
async function uploadChunks(context, parsed, transferId, sender = sendOperation) {
	for (let offset = 0; offset < parsed.totalBytes; offset += parsed.chunkBytes) {
		const chunk = parsed.buffer.subarray(offset, offset + parsed.chunkBytes);
		const result = settled(await sender(context, "fileTransferWriteChunk", {
			transferId,
			offset,
			content64: chunk.toString("base64"),
			sha256: chunkSha256(chunk)
		}), "transfer_chunk_unconfirmed");

		if (result.transferId && result.transferId !== transferId) {
			throw new Error("transfer_chunk_identity_mismatch");
		}
	}
}

/** Stages and transactionally publishes one full replacement file. */
async function publish(context, parsed, sender = sendOperation) {
	let transferId = "";
	let publishStarted = false;
	try {
		const created = settled(await sender(context, "fileTransferCreate", {
			path: parsed.path,
			totalBytes: parsed.totalBytes,
			sha256: parsed.sha256,
			chunkBytes: parsed.chunkBytes,
			overwrite: true
		}), "transfer_create_unconfirmed");
		transferId = String(created.transferId || "");
		if (!transferId) {
			throw new Error("transfer_id_missing");
		}

		await uploadChunks(context, parsed, transferId, sender);
		publishStarted = true;
		const publishResult = settled(await sender(context, "bulkWriteTransfers", {
			transfers: [transferId]
		}), "transfer_publish_unconfirmed");
		return {
			transferId,
			publish: publishResult
		};
	} catch (error) {
		if (transferId && !publishStarted) {
			await sender(context, "fileTransferCancel", { transferId }).catch(() => undefined);
		}
		throw error;
	}
}

module.exports = {
	chunkSha256,
	operationPayload,
	publish,
	sendOperation,
	settled,
	uploadChunks
};
