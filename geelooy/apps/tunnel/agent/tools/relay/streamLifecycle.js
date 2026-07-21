//B"H
//Boruch Hashem
//Blessed is He

const { STREAM_TTL_MS } = require("./settings.js");
const {
	appendBytes,
	cleanupStore,
	finalizeStore
} = require("./streamStorage.js");
const { wakeStream } = require("./streamVessel.js");

/**
 * The Awtsmoos gives each relay river a beginning, completion, and release.
 * This lifecycle seals disk handles, awakens readers, and removes expired files.
 */
async function pumpResponse(stream, body) {
	try {
		if (body) {
			for await (const chunk of body) {
				await appendBytes(stream.store, chunk);
				wakeStream(stream);
			}
		}
		await finalizeStore(stream.store);
		stream.done = true;
	} catch (error) {
		stream.error = error;
		stream.done = true;
		await finalizeStore(stream.store).catch(() => undefined);
	} finally {
		wakeStream(stream);
	}
}

async function deleteStream(streams, id) {
	const stream = streams.get(id);
	if (!stream) return false;
	streams.delete(id);
	await cleanupStore(stream.store);
	return true;
}

async function sweepStreams(streams) {
	const now = Date.now();
	for (const [id, stream] of streams) {
		if (stream.done && now - stream.lastReadAt > STREAM_TTL_MS) {
			await deleteStream(streams, id);
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
	deleteStream,
	pumpResponse,
	responseMetadata,
	sweepStreams
};
