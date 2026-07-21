//B"H
//Boruch Hashem
//Blessed is He

const { STREAM_TTL_MS } = require("./settings.js");
const {
	CHUNK_BYTES,
	appendBounded,
	createRelayStream,
	encodeDataUrl,
	waitForChunk,
	wakeStream
} = require("./streamVessel.js");

const streams = new Map();

/**
 * Native and browser responses become the same bounded relay river. The
 * Awtsmoos creates every byte continuously; this store refuses to hide a long
 * audio file inside one giant JSON or base64 value.
 */
function rememberResponse(response) {
	sweepStreams();
	const stream = createRelayStream();
	streams.set(stream.id, stream);
	pumpResponse(stream, response.body);
	return responseMetadata(response, stream.id);
}

function rememberStaticResponse(metadata = {}, body = "") {
	sweepStreams();
	const stream = createRelayStream();
	appendBounded(
		stream,
		Buffer.isBuffer(body) ? body : Buffer.from(String(body || ""), "utf8")
	);
	stream.done = true;
	streams.set(stream.id, stream);
	return responseMetadata(metadata, stream.id);
}

async function readRelayBody({ id, bodyAction, cursor = 0 }) {
	const stream = streams.get(id);
	if (!stream) {
		throw new Error("Response not found or already consumed.");
	}
	stream.lastReadAt = Date.now();
	if (bodyAction === "read") {
		return await readChunk(stream, Number(cursor));
	}
	if (bodyAction === "resume") {
		return resumeChunks(stream, Number(cursor));
	}
	if (["text", "json", "blob"].includes(bodyAction)) {
		return await readWholeBody(stream, bodyAction);
	}
	throw new Error(`Unknown body action: ${bodyAction}`);
}

async function pumpResponse(stream, body) {
	try {
		if (body) {
			for await (const chunk of body) {
				appendBounded(stream, chunk);
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

async function readChunk(stream, cursor) {
	const readiness = await waitForChunk(stream, cursor);
	if (readiness === "pending") {
		return { pending: true, retryAfter: 700 };
	}
	if (stream.error) {
		throw stream.error;
	}
	const chunk = stream.chunks[cursor];
	if (!chunk) {
		return { chunk: null, index: cursor, done: true };
	}
	return { chunk: encodeDataUrl(chunk), index: cursor, done: false };
}

function resumeChunks(stream, cursor) {
	const chunks = [];
	for (let index = cursor; index < stream.chunks.length; index += 1) {
		chunks.push({ index, chunk: encodeDataUrl(stream.chunks[index]) });
	}
	return { chunks, done: stream.done, error: stream.error?.stack || null };
}

async function readWholeBody(stream, action) {
	while (!stream.done && !stream.error) {
		await new Promise(resolve => stream.waiters.push(resolve));
	}
	if (stream.error) {
		throw stream.error;
	}
	const bytes = Buffer.concat(stream.chunks);
	if (action === "blob") {
		return encodeDataUrl(bytes);
	}
	const text = bytes.toString("utf8");
	return action === "json" ? JSON.parse(text) : text;
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

function sweepStreams() {
	const now = Date.now();
	for (const [id, stream] of streams) {
		if (stream.done && now - stream.lastReadAt > STREAM_TTL_MS) {
			streams.delete(id);
		}
	}
}

module.exports = {
	CHUNK_BYTES,
	rememberResponse,
	rememberStaticResponse,
	readRelayBody,
	streams
};
