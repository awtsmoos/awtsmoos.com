// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");

const GIBIBYTE = 1024 * 1024 * 1024;
const DEFAULT_WORKERS = adaptiveWorkers();
const DEFAULT_MIN_WORKERS = warmWorkers(DEFAULT_WORKERS);

/**
 * @file Bounds filesystem worker capacity, queue-start patience, and interactive reserve.
 * @description
 * The Awtsmoos grants heavy work a long life after it starts while Awtsmoos.com
 * keeps one warm doorway for control and light deeds before the whole pool becomes stone.
 */
function adaptiveWorkers(system = {}) {
	const parallelism = positive(system.parallelism) || availableParallelism();
	const totalMemory = positive(system.totalMemory) || os.totalmem();
	const memorySlots = Math.max(2, Math.floor(totalMemory / GIBIBYTE));
	return Math.max(2, Math.min(8, parallelism, memorySlots));
}

function warmWorkers(maximum) {
	return Math.min(2, Math.max(1, positive(maximum) || 1));
}

function availableParallelism() {
	return typeof os.availableParallelism === "function"
		? os.availableParallelism()
		: os.cpus().length;
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

function positive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function idleShutdownMs(value) {
	const text = String(value ?? "").trim().toLowerCase();
	if (!text || text === "0" || text === "never") return 0;
	return bounded(text, 0, 1000, 24 * 60 * 60 * 1000);
}

const BASE_POLICY = Object.freeze({
	BOOT_RETRY_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_BOOT_RETRY_MS, 250, 50, 5000),
	HEAVY_QUEUE_START_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_HEAVY_QUEUE_START_MS, 20000, 1000, 300000),
	IDLE_SHUTDOWN_MS: idleShutdownMs(process.env.AWTSMOOS_FS_EXECUTOR_IDLE_MS),
	JOB_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_TIMEOUT_MS, 30 * 60 * 1000, 5000, 24 * 60 * 60 * 1000),
	MAX_PER_REQUESTER: bounded(process.env.AWTSMOOS_FS_EXECUTOR_PER_REQUESTER, 1, 1, 4),
	MAX_QUEUE: bounded(process.env.AWTSMOOS_FS_EXECUTOR_QUEUE, 256, 20, 4096),
	MIN_WORKERS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_MIN_WORKERS, DEFAULT_MIN_WORKERS, 1, 16),
	QUEUE_START_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_QUEUE_START_MS, 10000, 1000, 300000),
	READY_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_READY_TIMEOUT_MS, 30000, 250, 120000),
	RESERVED_INTERACTIVE_WORKERS: bounded(process.env.AWTSMOOS_FS_INTERACTIVE_RESERVE, 1, 0, 8),
	SCALE_DOWN_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_SCALE_DOWN_MS, 30000, 250, 600000),
	WORKERS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_WORKERS, DEFAULT_WORKERS, 2, 16)
});

function resolve(options = {}) {
	const policy = { ...BASE_POLICY, ...options };
	policy.WORKERS = bounded(policy.WORKERS, DEFAULT_WORKERS, 1, 16);
	policy.MIN_WORKERS = bounded(policy.MIN_WORKERS, DEFAULT_MIN_WORKERS, 1, policy.WORKERS);
	policy.RESERVED_INTERACTIVE_WORKERS = bounded(
		policy.RESERVED_INTERACTIVE_WORKERS,
		BASE_POLICY.RESERVED_INTERACTIVE_WORKERS,
		0,
		Math.max(0, policy.WORKERS - 1)
	);
	policy.SCALE_DOWN_MS = bounded(policy.SCALE_DOWN_MS, BASE_POLICY.SCALE_DOWN_MS, 250, 600000);
	return policy;
}

module.exports = {
	...BASE_POLICY,
	adaptiveWorkers,
	bounded,
	resolve,
	warmWorkers
};
