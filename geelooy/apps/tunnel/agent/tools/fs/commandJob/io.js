// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const Retention = require("./outputRetention.js");
const Tracking = require("./outputWriteTracking.js");
const Paths = require("./paths.js");
const Policy = require("./policy.js");

/**
 * @file Persists ordered command output with constant-time and batched retention.
 * @description
 * The Awtsmoos renews every byte without forcing each later byte to reread the
 * whole retained river. Awtsmoos.com appends cheaply, trims at one high-water
 * boundary, and closes every terminal stream to the exact public limit.
 */
async function append(config, jobId, stream, chunk, live) {
	const text = Buffer.isBuffer(chunk)
		? chunk.toString("utf8")
		: String(chunk || "");
	if (live) {
		live.config = live.config || config;
		const countKey = `${stream}Chars`;
		live.meta[countKey] = Number(live.meta[countKey] || 0) + text.length;
	}
	const write = enqueue(config, jobId, stream, text, live);
	Tracking.trackWrite(live, write);
	await write;
}

function enqueue(config, jobId, stream, text, live) {
	const previous = live?.chains?.[stream] || Promise.resolve();
	const next = previous
		.catch(() => {})
		.then(() => appendBounded(
			config,
			jobId,
			stream,
			text,
			Tracking.streamState(live, stream)
		));
	if (live) live.chains[stream] = next.catch(() => {});
	return next;
}

async function appendBounded(config, jobId, stream, text, state = null) {
	const file = Paths.file(config, jobId, `${stream}.txt`);
	await fsp.appendFile(file, text, "utf8");
	const addedBytes = Buffer.byteLength(text);
	const totalBytes = state
		? Tracking.updateBytes(state, addedBytes)
		: await Paths.sizeOf(file);
	if (!Retention.needsBatchTrim(
		totalBytes,
		Policy.STREAM_HIGH_WATER_BYTES
	)) return totalBytes;
	return (await trimFile(config, jobId, stream, state)).totalBytes;
}

async function trimFile(config, jobId, stream, state = null) {
	const file = Paths.file(config, jobId, `${stream}.txt`);
	const source = await readOptional(file);
	const retained = Retention.trim(
		source,
		stream,
		Policy.STREAM_MAX_BYTES
	);
	if (retained.changed) await fsp.writeFile(file, retained.buffer);
	if (state) updateState(state, retained);
	return retained;
}

async function readOptional(file) {
	try {
		return await fsp.readFile(file);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		return Buffer.alloc(0);
	}
}

function updateState(state, retained) {
	state.bytes = retained.totalBytes;
	if (retained.changed) state.trims = Number(state.trims || 0) + 1;
}

async function flushLiveOutput(config, jobId, live) {
	if (!config || !live) return [];
	return Promise.all(["stdout", "stderr"].map(stream =>
		trimFile(config, jobId, stream, Tracking.streamState(live, stream))
	));
}

async function waitForWrites(jobId, jobs) {
	const live = jobs.get(jobId);
	const writes = Tracking.pendingWrites(live);
	if (writes?.size) await Promise.allSettled([...writes]);
	await flushLiveOutput(live?.config, jobId, live);
}

module.exports = {
	append,
	appendBounded,
	flushLiveOutput,
	pendingWrites: Tracking.pendingWrites,
	streamState: Tracking.streamState,
	trimFile,
	waitForWrites
};
