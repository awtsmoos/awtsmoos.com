// B"H

const os = require("node:os");

const DEFAULT_WORKERS = Math.min(4, Math.max(2, Math.ceil(os.cpus().length / 8)));

/** Converts an environment value into a bounded integer. */
function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = {
	IDLE_SHUTDOWN_MS: idleShutdownMs(
		process.env.AWTSMOOS_FS_EXECUTOR_IDLE_MS
	),
	JOB_TIMEOUT_MS: bounded(
		process.env.AWTSMOOS_FS_EXECUTOR_TIMEOUT_MS,
		30 * 60 * 1000,
		5000,
		24 * 60 * 60 * 1000
	),
	MAX_PER_REQUESTER: bounded(
		process.env.AWTSMOOS_FS_EXECUTOR_PER_REQUESTER,
		1,
		1,
		4
	),
	MAX_QUEUE: bounded(
		process.env.AWTSMOOS_FS_EXECUTOR_QUEUE,
		256,
		20,
		4096
	),
	WORKERS: bounded(
		process.env.AWTSMOOS_FS_EXECUTOR_WORKERS,
		DEFAULT_WORKERS,
		2,
		16
	),
	bounded
};

/** Zero keeps prewarmed workers alive until graceful runtime shutdown. */
function idleShutdownMs(value) {
	const text = String(value ?? "").trim().toLowerCase();
	if (!text || text === "0" || text === "never") return 0;
	return bounded(text, 0, 1000, 24 * 60 * 60 * 1000);
}
