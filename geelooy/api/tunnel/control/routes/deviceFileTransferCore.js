// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_MAX_CHUNKS = 8;
const MAX_CHUNKS = 32;

/**
 * @file Pumps bounded verified chunks from one authorized tunnel vessel into another.
 * @description The Awtsmoos joins two devices without holding the whole file between them;
 * Awtsmoos.com lets the destination manifest remember truth so every later GET can resume safely.
 */
async function pump(input = {}, send) {
	const source = required(input.source, "source_route_required");
	const destination = required(input.destination, "destination_route_required");
	const sourcePath = required(input.sourcePath, "source_path_required");
	const maxChunks = boundedChunks(input.maxChunks);
	let transferId = String(input.transferId || "");
	let status;
	let proof = null;
	if (!transferId) {
		const destinationPath = required(input.destinationPath, "destination_path_required");
		proof = await send(source, "fileTransferSourceProof", "tunnel.read", { path: sourcePath });
		status = await send(destination, "fileTransferCreate", "tunnel.write", {
			path: destinationPath,
			totalBytes: proof.totalBytes,
			sha256: proof.sha256,
			chunkBytes: input.chunkBytes,
			overwrite: input.overwrite === true
		});
		transferId = status.transferId;
	} else {
		status = await send(destination, "fileTransferStatus", "tunnel.read", { transferId });
	}
	let moved = 0;
	while (!status.complete && moved < maxChunks) {
		const chunk = await send(source, "fileTransferReadChunk", "tunnel.read", {
			path: sourcePath,
			offset: status.nextOffset,
			maxBytes: status.chunkBytes
		});
		status = await send(destination, "fileTransferWriteChunk", "tunnel.write", {
			transferId,
			offset: chunk.offset,
			content64: chunk.content64,
			sha256: chunk.sha256
		});
		moved += 1;
	}
	let committed = null;
	if (status.complete) {
		committed = await send(destination, "fileTransferCommit", "tunnel.write", { transferId });
	}
	return result(input, transferId, status, proof, moved, committed);
}

function result(input, transferId, status, proof, moved, committed) {
	return {
		ok: true,
		transferId,
		done: Boolean(committed),
		chunksMoved: moved,
		nextOffset: status.nextOffset ?? status.receivedBytes ?? 0,
		receivedBytes: status.receivedBytes ?? committed?.bytes ?? 0,
		totalBytes: status.totalBytes ?? proof?.totalBytes ?? committed?.bytes ?? 0,
		sha256: committed?.sha256 || status.expectedSha256 || proof?.sha256 || "",
		committed,
		continuation: committed ? null : {
			source: input.source,
			destination: input.destination,
			sourcePath: input.sourcePath,
			transferId
		}
	};
}
function boundedChunks(value) {
	const number = Number(value || DEFAULT_MAX_CHUNKS);
	return Number.isInteger(number) && number >= 1 ? Math.min(number, MAX_CHUNKS) : DEFAULT_MAX_CHUNKS;
}
function required(value, code) {
	const text = String(value || "").trim();
	if (!text) { const error = new Error(code); error.code = code; throw error; }
	return text;
}

module.exports = { DEFAULT_MAX_CHUNKS, MAX_CHUNKS, boundedChunks, pump };
