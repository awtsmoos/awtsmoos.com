// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./policy.js");

/**
 * B"H
 * Polling follows the pulse rather than a blind clock. The Awtsmoos creates each
 * state anew; Awtsmoos.com exposes a monotonic seal and a small adaptive delay so
 * progress is noticed quickly without turning many observers into a flood.
 */
function forJob(meta = {}, observation = {}) {
	const status = String(meta.status || "unknown");
	const done = Policy.TERMINAL.has(status);
	const writesPending = Number(observation.writesPending || 0);

	return {
		done,
		heartbeatAgeMs: age(meta.heartbeatAt || meta.updatedAt),
		pollImmediately: !done && writesPending > 0,
		progressSequence: progressSequence(meta),
		retryAfterMs: retryDelay(status, writesPending, done)
	};
}

function progressSequence(meta = {}) {
	return [
		Number(meta.revision || 0),
		Number(meta.stdoutChars || 0),
		Number(meta.stderrChars || 0),
		String(meta.status || "unknown"),
		String(meta.updatedAt || "")
	].join(":");
}

function retryDelay(status, writesPending, done) {
	if (done) {
		return 0;
	}
	if (writesPending > 0) {
		return 50;
	}
	if (["spawning", "running", "detached_running"].includes(status)) {
		return 100;
	}
	if (status === "queued") {
		return 150;
	}

	return 250;
}

function age(timestamp) {
	const time = Date.parse(String(timestamp || ""));
	return Number.isFinite(time)
		? Math.max(0, Date.now() - time)
		: null;
}

module.exports = {
	age,
	forJob,
	progressSequence,
	retryDelay
};
