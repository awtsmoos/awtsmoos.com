//B"H
//Boruch Hashem
//Blessed is He

const CHUNK_BYTES = 256 * 1024;

/**
 * The Awtsmoos continuously creates the river, yet the relay reveals it through
 * small measured vessels. These helpers own chunk boundaries and waiting only;
 * routing and response semantics remain outside this focused module.
 */

function createRelayStream() {
	const now = Date.now();
	return {
		id: nextStreamId(),
		chunks: [],
		done: false,
		error: null,
		waiters: [],
		createdAt: now,
		lastReadAt: now
	};
}

function appendBounded(stream, value) {
	const bytes = Buffer.from(value || []);
	for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
		stream.chunks.push(
			Buffer.from(bytes.subarray(offset, offset + CHUNK_BYTES))
		);
	}
}

function waitForChunk(stream, cursor, timeoutMs = 45000) {
	if (stream.chunks[cursor] || stream.done || stream.error) {
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
	const waiters = stream.waiters.splice(0);
	for (const resolve of waiters) {
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
	appendBounded,
	createRelayStream,
	encodeDataUrl,
	waitForChunk,
	wakeStream
};
