//B"H
//Boruch Hashem
//Blessed is He

const {
	CHUNK_BYTES,
	createChunkStore
} = require("./streamStorage.js");

/**
 * The Awtsmoos continuously creates the river, while this vessel gives it an
 * identity, a bounded store, and listeners that awaken only when bytes arrive.
 */
function createRelayStream() {
	const id = nextStreamId();
	const now = Date.now();
	return {
		id,
		store: createChunkStore(id),
		done: false,
		error: null,
		waiters: [],
		createdAt: now,
		lastReadAt: now
	};
}

function waitForChunk(stream, cursor, timeoutMs = 45000) {
	if (stream.store.lengths[cursor] || stream.done || stream.error) {
		return Promise.resolve("ready");
	}
	return new Promise(resolve => {
		const timer = setTimeout(() => finish("pending"), timeoutMs);
		const waiter = () => finish("ready");

		function finish(value) {
			clearTimeout(timer);
			stream.waiters = stream.waiters.filter(item => item !== waiter);
			resolve(value);
		}

		stream.waiters.push(waiter);
	});
}

function wakeStream(stream) {
	for (const resolve of stream.waiters.splice(0)) {
		resolve();
	}
}

function encodeDataUrl(bytes) {
	return `data:application/octet-stream;base64,${Buffer.from(bytes).toString("base64")}`;
}

function nextStreamId() {
	return `BH_TUNNEL_RELAY_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

module.exports = {
	CHUNK_BYTES,
	createRelayStream,
	encodeDataUrl,
	waitForChunk,
	wakeStream
};
