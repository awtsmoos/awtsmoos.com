//B"H
//Boruch Hashem
//Blessed is He

const {
	readAll,
	readChunk,
	storeDiagnostics
} = require("./streamStorage.js");
const {
	encodeDataUrl,
	waitForChunk
} = require("./streamVessel.js");

const DEFAULT_RESUME_LIMIT = 16;
const MAX_RESUME_LIMIT = 64;

/**
 * The Awtsmoos reveals only the requested measure: one chunk for a reader, a
 * bounded page for resume, or the whole completed body for legacy consumers.
 */
async function readStreamChunk(stream, cursor) {
	const readiness = await waitForChunk(stream, cursor);
	if (readiness === "pending") {
		return { pending: true, retryAfter: 700 };
	}
	throwStreamError(stream);
	const chunk = await readChunk(stream.store, cursor);
	if (!chunk) {
		return { chunk: null, index: cursor, done: true };
	}
	return {
		chunk: encodeDataUrl(chunk),
		index: cursor,
		done: false
	};
}

async function resumeStreamPage(stream, cursor, requestedLimit) {
	const limit = normalizeLimit(requestedLimit);
	const count = stream.store.lengths.length;
	if (cursor >= count && !stream.done && !stream.error) {
		return { pending: true, done: false, chunks: [], retryAfter: 700 };
	}
	throwStreamError(stream);
	const end = Math.min(count, cursor + limit);
	const chunks = [];
	for (let index = cursor; index < end; index += 1) {
		const chunk = await readChunk(stream.store, index);
		if (chunk) {
			chunks.push({ index, chunk: encodeDataUrl(chunk) });
		}
	}
	return {
		chunks,
		done: stream.done && end >= count,
		more: end < count,
		nextCursor: end,
		storage: storeDiagnostics(stream.store),
		error: stream.error?.stack || null
	};
}

async function readWholeBody(stream, action) {
	await waitForCompletion(stream);
	throwStreamError(stream);
	const bytes = await readAll(stream.store);
	if (action === "blob") {
		return encodeDataUrl(bytes);
	}
	const text = bytes.toString("utf8");
	return action === "json" ? JSON.parse(text) : text;
}

function streamDiagnostics(stream) {
	return {
		id: stream.id,
		done: stream.done,
		error: stream.error?.message || null,
		createdAt: stream.createdAt,
		lastReadAt: stream.lastReadAt,
		...storeDiagnostics(stream.store)
	};
}

async function waitForCompletion(stream) {
	while (!stream.done && !stream.error) {
		await new Promise(resolve => stream.waiters.push(resolve));
	}
}

function throwStreamError(stream) {
	if (stream.error) {
		throw stream.error;
	}
}

function normalizeLimit(value) {
	const parsed = Number(value || DEFAULT_RESUME_LIMIT);
	if (!Number.isFinite(parsed)) {
		return DEFAULT_RESUME_LIMIT;
	}
	return Math.max(1, Math.min(MAX_RESUME_LIMIT, Math.floor(parsed)));
}

module.exports = {
	MAX_RESUME_LIMIT,
	readStreamChunk,
	readWholeBody,
	resumeStreamPage,
	streamDiagnostics
};
