// B"H

/**
 * B"H — Output is counted while it flows, never rediscovered by repeatedly
 * reading an entire river. Only a bounded tail remains in memory.
 */
function createOutputCounters(options = {}) {
	const maxBytes = positive(options.maxBytes, 1024 * 1024);
	const streams = {
		stdout: createStream(maxBytes),
		stderr: createStream(maxBytes)
	};

	function append(streamName, chunk) {
		const stream = streams[streamName === "stderr" ? "stderr" : "stdout"];
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk || ""));
		stream.totalBytes += buffer.length;
		stream.totalChars += buffer.toString("utf8").length;
		stream.chunks += 1;
		stream.tail = Buffer.concat([stream.tail, buffer]);
		if (stream.tail.length > maxBytes) {
			stream.omittedBytes += stream.tail.length - maxBytes;
			stream.tail = stream.tail.subarray(stream.tail.length - maxBytes);
			stream.truncated = true;
		}
		return publicStream(stream);
	}

	function read(streamName, offset = 0, maxChars = 12000) {
		const stream = streams[streamName === "stderr" ? "stderr" : "stdout"];
		const text = stream.tail.toString("utf8");
		const start = Math.max(0, Math.floor(Number(offset) || 0));
		const limit = Math.max(1, Math.floor(Number(maxChars) || 12000));
		return text.slice(start, start + limit);
	}

	function snapshot() {
		return { stdout: publicStream(streams.stdout), stderr: publicStream(streams.stderr), maxBytes };
	}

	return { append, read, snapshot };
}

function createStream(maxBytes) {
	return { totalBytes: 0, totalChars: 0, omittedBytes: 0, chunks: 0, truncated: false, tail: Buffer.alloc(0), maxBytes };
}
function publicStream(stream) {
	return {
		totalBytes: stream.totalBytes,
		totalChars: stream.totalChars,
		storedBytes: stream.tail.length,
		omittedBytes: stream.omittedBytes,
		chunks: stream.chunks,
		truncated: stream.truncated
	};
}
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
module.exports = { createOutputCounters };
