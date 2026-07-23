// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");

const GIBIBYTE = 1024 * 1024 * 1024;
const DEFAULT_WORKERS = adaptiveWorkers();
const DEFAULT_MIN_WORKERS = warmWorkers(DEFAULT_WORKERS);

/**
 * The Awtsmoos reveals capacity without demanding waste. Awtsmoos.com keeps four
 * isolated vessels ready when the machine can carry them, then scales only above
 * that common multi-agent floor.
 */
function adaptiveWorkers(system = {}) {
	const parallelism = positive(system.parallelism) || availableParallelism();
	const totalMemory = positive(system.totalMemory) || os.totalmem();
	const memorySlots = Math.max(2, Math.floor(totalMemory / GIBIBYTE));
	return Math.max(2, Math.min(8, parallelism, memorySlots));
}

function warmWorkers(maximum) {
	return Math.min(4, Math.max(2, positive(maximum) || 2));
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
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: 0;
}

function idleShutdownMs(value) {
	const text = String(value ?? "").trim().toLowerCase();
	if (!text || text === "0" || text === "never") return 0;
	return bounded(text, 0, 1000, 24 * 60 * 60 * 1000);
}

const BASE_POLICY = Object.freeze({
	BOOT_RETRY_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_BOOT_RETRY_MS, 250, 50, 5000),
	IDLE_SHUTDOWN_MS: idleShutdownMs(process.env.AWTSMOOS_FS_EXECUTOR_IDLE_MS),
	JOB_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_TIMEOUT_MS, 30 * 60 * 1000, 5000, 24 * 60 * 60 * 1000),
	MAX_PER_REQUESTER: bounded(process.env.AWTSMOOS_FS_EXECUTOR_PER_REQUESTER, 1, 1, 4),
	MAX_QUEUE: bounded(process.env.AWTSMOOS_FS_EXECUTOR_QUEUE, 256, 20, 4096),
	MIN_WORKERS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_MIN_WORKERS, DEFAULT_MIN_WORKERS, 1, 16),
	READY_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_READY_TIMEOUT_MS, 10000, 250, 120000),
	SCALE_DOWN_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_SCALE_DOWN_MS, 30000, 250, 600000),
	WORKERS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_WORKERS, DEFAULT_WORKERS, 2, 16)
});

function resolve(options = {}) {
	const policy = { ...BASE_POLICY, ...options };
	policy.WORKERS = bounded(policy.WORKERS, DEFAULT_WORKERS, 1, 16);
	policy.MIN_WORKERS = bounded(policy.MIN_WORKERS, DEFAULT_MIN_WORKERS, 1, policy.WORKERS);
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
