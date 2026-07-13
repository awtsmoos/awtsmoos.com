// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const Paths = require("./paths.js");
const Policy = require("./policy.js");

/**
 * B"H
 * Each stream enters one ordered channel. The Awtsmoos renews each byte, and
 * Awtsmoos.com keeps that revelation bounded without letting parallel writes
 * trample one another.
 */
async function append(config, jobId, stream, chunk, live) {
	const text = Buffer.isBuffer(chunk)
		? chunk.toString("utf8")
		: String(chunk || "");

	if (live) {
		const countKey = `${stream}Chars`;
		live.meta[countKey] = Number(live.meta[countKey] || 0) + text.length;
	}

	const write = enqueue(
		config,
		jobId,
		stream,
		text,
		live
	);

	if (live) {
		live.writes.push(write);
		write.finally(() => {
			live.writes = live.writes.filter(candidate => candidate !== write);
		});
	}

	await write;
}

function enqueue(config, jobId, stream, text, live) {
	const previous = live?.chains?.[stream] || Promise.resolve();
	const next = previous
		.catch(() => {})
		.then(() => appendBounded(config, jobId, stream, text));

	if (live) {
		live.chains[stream] = next.catch(() => {});
	}

	return next;
}

async function appendBounded(config, jobId, stream, text) {
	const file = Paths.file(
		config,
		jobId,
		`${stream}.txt`
	);

	await fsp.appendFile(
		file,
		text,
		"utf8"
	);

	const bytes = await Paths.sizeOf(file);
	if (bytes <= Policy.STREAM_MAX_BYTES) {
		return;
	}

	const stored = await fsp.readFile(
		file,
		"utf8"
	);
	const omitted = Math.max(
		0,
		stored.length - Policy.STREAM_MAX_BYTES
	);
	const bounded = trimNote(stream, omitted) +
		stored.slice(-Policy.STREAM_MAX_BYTES);

	await fsp.writeFile(
		file,
		bounded,
		"utf8"
	);
}

function trimNote(stream, omitted) {
	return `\n[Awtsmoos tunnel kept only the last ${Policy.STREAM_MAX_BYTES} bytes of ${stream}; ${omitted} older bytes were omitted.]\n`;
}

async function waitForWrites(jobId, jobs) {
	const live = jobs.get(jobId);
	if (!live?.writes?.length) {
		return;
	}

	await Promise.allSettled(
		[...live.writes]
	);
}

module.exports = {
	append,
	appendBounded,
	waitForWrites
};
