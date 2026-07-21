//B"H
//Boruch Hashem
//Blessed is He

const { STREAM_TTL_MS } = require("./settings.js");
const {
	CHUNK_BYTES,
	appendBytes,
	cleanupStore
} = require("./streamStorage.js");
const {
	createRelayStream,
	wakeStream
} = require("./streamVessel.js");
const {
	readStreamChunk,
	readWholeBody,
	resumeStreamPage,
	streamDiagnostics
} = require("./streamReadActions.js");

const streams = new Map();

/**
 * Every response becomes one bounded river. The Awtsmoos creates each byte
 * continuously; this lifecycle lets memory yield to disk without changing the
 * cursor contract seen by audio, conversations, or extension-compatible code.
 */
function rememberResponse(response) {
	return rememberReadableResponse(response, response.body);
}

function rememberReadableResponse(metadata = {}, body = null) {
	void sweepStreams().catch(() => undefined);
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
		return { released: await deleteStream(stream.id) };
	}
	throw new Error(`Unknown body action: ${payload.bodyAction}`);
}

async function pumpResponse(stream, body) {
	try {
		if (body) {
			for await (const chunk of body) {
				await appendBytes(stream.store, chunk);
				wakeStream(stream);
			}
		}
		stream.done = true;
	} catch (error) {
		stream.error = error;
		stream.done = true;
	} finally {
		wakeStream(stream);
	}
}

async function deleteStream(id) {
	const stream = streams.get(id);
	if (!stream) {
		return false;
	}
	streams.delete(id);
	await cleanupStore(stream.store);
	return true;
}

async function sweepStreams() {
	const now = Date.now();
	for (const [id, stream] of streams) {
		if (stream.done && now - stream.lastReadAt > STREAM_TTL_MS) {
			await deleteStream(id);
		}
	}
}

function responseMetadata(source, streamId) {
	const headers = source.headers instanceof Headers
		? Array.from(source.headers.entries())
		: source.headers || [];
	return {
		status: source.status || 200,
		ok: source.ok !== false,
		headers,
		url: source.url || "",
		redirected: Boolean(source.redirected),
		streamId,
		id: streamId
	};
}

module.exports = {
	CHUNK_BYTES,
	deleteStream,
	rememberReadableResponse,
	rememberResponse,
	rememberStaticResponse,
	readRelayBody,
	streams
};
