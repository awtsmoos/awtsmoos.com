// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");

const MEBIBYTE = 1024 * 1024;
const DEFAULT_WORKERS = adaptiveWorkers();
const DEFAULT_MIN_WORKERS = warmWorkers(DEFAULT_WORKERS);

/**
 * @file Gives many filesystem requesters isolated workers with bounded local healing.
 * @description
 * The Awtsmoos reveals one filesystem through measured vessels. Awtsmoos.com scales
 * physical workers to the machine and lets repeated worker death quarantine only its
 * proven family for a short interval, preserving an interactive doorway for the rest.
 */
function adaptiveWorkers(system = {}) {
	const parallelism = positive(system.parallelism) || availableParallelism();
	const totalMemory = positive(system.totalMemory) || os.totalmem();
	const memorySlots = Math.max(4, Math.floor(totalMemory / (512 * MEBIBYTE)));
	return Math.max(4, Math.min(32, parallelism * 4, memorySlots));
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
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function idleShutdownMs(value) {
	const text = String(value ?? "").trim().toLowerCase();
	if (!text || text === "0" || text === "never") return 0;
	return bounded(text, 0, 1000, 24 * 60 * 60 * 1000);
}

/**
 * Default per-worker V8 heap cap in megabytes. Each forked child is a separate
 * vessel, so the pool's memory budget is split across the worker count: half
 * the machine's per-worker memory share, bounded to a sane interval. An
 * explicit AWTSMOOS_FS_EXECUTOR_CHILD_HEAP_MB always wins and is never
 * rescaled by resolve().
 */
function defaultChildHeapMb(workers) {
	const totalMb = Math.floor(os.totalmem() / MEBIBYTE);
	return Math.max(128, Math.min(4096, Math.floor(totalMb / Math.max(1, workers) / 2)));
}

const BASE_POLICY = Object.freeze({
	BOOT_RETRY_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_BOOT_RETRY_MS, 250, 50, 5000),
	CANCEL_GRACE_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_CANCEL_GRACE_MS, 1000, 100, 30000),
	CHILD_MAX_OLD_SPACE_MB: process.env.AWTSMOOS_FS_EXECUTOR_CHILD_HEAP_MB == null
		? defaultChildHeapMb(DEFAULT_WORKERS)
		: bounded(process.env.AWTSMOOS_FS_EXECUTOR_CHILD_HEAP_MB, 512, 64, 8192),
	FAMILY_FAILURE_COOLDOWN_MS: bounded(process.env.AWTSMOOS_FS_FAMILY_COOLDOWN_MS, 5000, 100, 300000),
	FAMILY_FAILURE_THRESHOLD: bounded(process.env.AWTSMOOS_FS_FAMILY_FAILURES, 2, 1, 16),
	FAMILY_FAILURE_WINDOW_MS: bounded(process.env.AWTSMOOS_FS_FAMILY_WINDOW_MS, 30000, 500, 600000),
	HEAVY_QUEUE_START_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_HEAVY_QUEUE_START_MS, 20000, 1000, 300000),
	IDEMPOTENCY_CACHE_SIZE: bounded(process.env.AWTSMOOS_FS_EXECUTOR_IDEMPOTENCY_SIZE, 1024, 64, 8192),
	IDEMPOTENCY_TTL_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_IDEMPOTENCY_TTL_MS, 60000, 1000, 600000),
	IDLE_SHUTDOWN_MS: idleShutdownMs(process.env.AWTSMOOS_FS_EXECUTOR_IDLE_MS),
	JOB_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_TIMEOUT_MS, 30 * 60 * 1000, 5000, 24 * 60 * 60 * 1000),
	JOB_TIMEOUT_LIGHT_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_LIGHT_TIMEOUT_MS, 5 * 60 * 1000, 30000, 30 * 60 * 1000),
	MAX_JOB_RESULT_BYTES: bounded(process.env.AWTSMOOS_FS_EXECUTOR_MAX_RESULT_BYTES, 64 * 1024 * 1024, 1024 * 1024, 512 * 1024 * 1024),
	MAX_PER_REQUESTER: bounded(process.env.AWTSMOOS_FS_EXECUTOR_PER_REQUESTER, 4, 1, 16),
	MAX_QUEUE: bounded(process.env.AWTSMOOS_FS_EXECUTOR_QUEUE, 8192, 64, 32768),
	MAX_QUEUE_PER_REQUESTER: bounded(process.env.AWTSMOOS_FS_EXECUTOR_QUEUE_PER_REQUESTER, 32, 1, 256),
	MIN_WORKERS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_MIN_WORKERS, DEFAULT_MIN_WORKERS, 1, 16),
	QUEUE_START_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_QUEUE_START_MS, 10000, 1000, 300000),
	READY_TIMEOUT_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_READY_TIMEOUT_MS, 30000, 250, 120000),
	RESERVED_INTERACTIVE_WORKERS: bounded(process.env.AWTSMOOS_FS_INTERACTIVE_RESERVE, 2, 0, 8),
	SATURATION_PUMPS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_SATURATION_PUMPS, 3, 1, 32),
	SCALE_DOWN_MS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_SCALE_DOWN_MS, 30000, 250, 600000),
	WORKERS: bounded(process.env.AWTSMOOS_FS_EXECUTOR_WORKERS, DEFAULT_WORKERS, 4, 64)
});

function resolve(options = {}) {
	const policy = { ...BASE_POLICY, ...options };
	policy.WORKERS = bounded(policy.WORKERS, DEFAULT_WORKERS, 1, 64);
	policy.MIN_WORKERS = bounded(policy.MIN_WORKERS, DEFAULT_MIN_WORKERS, 1, policy.WORKERS);
	policy.JOB_TIMEOUT_LIGHT_MS = bounded(policy.JOB_TIMEOUT_LIGHT_MS, 5 * 60 * 1000, 1000, policy.JOB_TIMEOUT_MS);
	policy.MAX_PER_REQUESTER = bounded(policy.MAX_PER_REQUESTER, 4, 1, 16);
	policy.MAX_QUEUE_PER_REQUESTER = bounded(policy.MAX_QUEUE_PER_REQUESTER, 32, 1, policy.MAX_QUEUE);
	policy.FAMILY_FAILURE_THRESHOLD = bounded(policy.FAMILY_FAILURE_THRESHOLD, 2, 1, 16);
	policy.FAMILY_FAILURE_COOLDOWN_MS = bounded(policy.FAMILY_FAILURE_COOLDOWN_MS, 5000, 100, 300000);
	policy.FAMILY_FAILURE_WINDOW_MS = bounded(policy.FAMILY_FAILURE_WINDOW_MS, 30000, 500, 600000);
	policy.RESERVED_INTERACTIVE_WORKERS = bounded(
		policy.RESERVED_INTERACTIVE_WORKERS,
		BASE_POLICY.RESERVED_INTERACTIVE_WORKERS,
		0,
		Math.max(0, policy.WORKERS - 1)
	);
	policy.SATURATION_PUMPS = bounded(policy.SATURATION_PUMPS, 3, 1, 32);
	policy.CANCEL_GRACE_MS = bounded(policy.CANCEL_GRACE_MS, 1000, 100, 30000);
	policy.IDEMPOTENCY_TTL_MS = bounded(policy.IDEMPOTENCY_TTL_MS, 60000, 1000, 600000);
	policy.IDEMPOTENCY_CACHE_SIZE = bounded(policy.IDEMPOTENCY_CACHE_SIZE, 1024, 64, 8192);
	policy.MAX_JOB_RESULT_BYTES = bounded(
		policy.MAX_JOB_RESULT_BYTES,
		64 * 1024 * 1024,
		1024 * 1024,
		512 * 1024 * 1024
	);
	// Rescale the per-worker heap share when the operator did not pin it:
	// the pool's memory budget is split across the configured worker count.
	if (
		process.env.AWTSMOOS_FS_EXECUTOR_CHILD_HEAP_MB == null &&
		options.CHILD_MAX_OLD_SPACE_MB == null
	) {
		policy.CHILD_MAX_OLD_SPACE_MB = defaultChildHeapMb(policy.WORKERS);
	} else {
		policy.CHILD_MAX_OLD_SPACE_MB = bounded(policy.CHILD_MAX_OLD_SPACE_MB, 512, 64, 8192);
	}
	return policy;
}

/**
 * Lanes with the short running bound. NOTE — deliberate asymmetry, do not
 * "fix": p2_chrome_light is bucketed HEAVY for concurrency (pool-priority.js:
 * it competes with p3/p4 for heavy slots so browser work cannot smother the
 * interactive lanes) but LIGHT for the running timeout (a wedged chrome deed
 * is still a wedged deed). The two classifications answer different questions:
 * who may run beside whom, versus how long a stuck job may hold its vessel.
 */
const LIGHT_LANES = new Set([
	"p0_control",
	"p0_wait",
	"p0_observe",
	"p1_command_admission",
	"p1_fs_light",
	"p2_chrome_light"
]);

/**
 * Returns the running (worker-assigned) timeout for one job's lane class.
 * Light/interactive lanes get the short bound: a light filesystem deed still
 * running after minutes is wedged by definition, and letting it hold a worker
 * for the full heavy timeout lets a few poisoned requesters smother every
 * other lane. Heavy/bulk lanes keep the long JOB_TIMEOUT_MS bound for patient
 * labor. Unknown lanes fall through to the long bound.
 * The one-second floor lets tests prove the wiring with fast policies, and
 * the light <= heavy invariant holds even when a caller overrides the two
 * bounds inconsistently.
 */
function runningTimeoutMs(policy = {}, lane = "") {
	const heavy = Math.max(1000, positiveOr(policy.JOB_TIMEOUT_MS, 30 * 60 * 1000));
	const light = Math.max(1000, positiveOr(policy.JOB_TIMEOUT_LIGHT_MS, 5 * 60 * 1000));
	if (LIGHT_LANES.has(String(lane || ""))) return Math.min(light, heavy);
	return heavy;
}

function positiveOr(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	...BASE_POLICY,
	adaptiveWorkers,
	bounded,
	defaultChildHeapMb,
	resolve,
	runningTimeoutMs,
	warmWorkers
};
