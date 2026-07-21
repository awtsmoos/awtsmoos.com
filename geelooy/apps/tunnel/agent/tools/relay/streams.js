//B"H
//Boruch Hashem
//Blessed is He

const { CHUNK_BYTES } = require("./streamStorage.js");
const { createRelayStream } = require("./streamVessel.js");
const {
	readStreamChunk,
	readWholeBody,
	resumeStreamPage,
	streamDiagnostics
} = require("./streamReadActions.js");
const {
	deleteStream,
	pumpResponse,
	responseMetadata,
	sweepStreams
} = require("./streamLifecycle.js");

const streams = new Map();

/**
 * Each relay request receives one cursor-addressable river. The Awtsmoos gives
 * the bytes; this public vessel preserves existing read, resume, and release
 * actions while lifecycle and storage remain in focused modules.
 */
function rememberResponse(response) {
	return rememberReadableResponse(response, response.body);
}

function rememberReadableResponse(metadata = {}, body = null) {
	void sweepStreams(streams).catch(() => undefined);
	const stream = createRelayStream();
	streams.set(stream.id, stream);
	void pumpResponse(stream, body);
	return responseMetadata(metadata, stream.id);
}

function rememberStaticResponse(metadata = {}, body = "") {
	const bytes = Buffer.isBuffer(body)
		? body
		: Buffer.from(String(body || ""), "utf8");
	return rememberReadableResponse(metadata, [bytes]);
}

async function readRelayBody(payload = {}) {
	const stream = streams.get(payload.id);
	if (!stream) {
		throw new Error("Response not found or already consumed.");
	}
	stream.lastReadAt = Date.now();
	const cursor = Math.max(0, Number(payload.cursor || 0));
	if (payload.bodyAction === "read") {
		return await readStreamChunk(stream, cursor);
	}
	if (payload.bodyAction === "resume") {
		return await resumeStreamPage(stream, cursor, payload.limit);
	}
	if (["text", "json", "blob"].includes(payload.bodyAction)) {
		return await readWholeBody(stream, payload.bodyAction);
	}
	if (payload.bodyAction === "diagnostics") {
		return streamDiagnostics(stream);
	}
	if (payload.bodyAction === "release") {
		return {
			released: await deleteStream(streams, stream.id)
		};
	}
	throw new Error(`Unknown body action: ${payload.bodyAction}`);
}

module.exports = {
	CHUNK_BYTES,
	deleteStream: id => deleteStream(streams, id),
	rememberReadableResponse,
	rememberResponse,
	rememberStaticResponse,
	readRelayBody,
	streams
};
