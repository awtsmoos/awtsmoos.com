// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_TIMEOUT_MS = 0;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * @file Keeps durable command queue-start expiry opt-in while preserving bounded policy when requested.
 * @description
 * The Awtsmoos lets deep logical command queues wait behind finite process vessels
 * without occupying a tunnel lane; Awtsmoos.com applies a start deadline only when
 * a caller or operator explicitly asks for one.
 */
function arm(record, onExpire, options = {}) {
	clear(record);
	const waitMs = timeoutMs(options.timeoutMs ?? record?.queueStartTimeoutMs);
	const queuedAtMs = Date.now();
	record.queueStartQueuedAtMs = queuedAtMs;
	if (!waitMs) {
		record.queueStartDeadlineAt = "";
		return { deadlineAt: "", enabled: false, timeoutMs: 0 };
	}
	record.queueStartDeadlineAt = new Date(queuedAtMs + waitMs).toISOString();
	record.queueStartTimer = setTimeout(() => {
		record.queueStartTimer = null;
		const waitedMs = Math.max(0, Date.now() - queuedAtMs);
		void Promise.resolve(onExpire(record, waitedMs)).catch(error => {
			record.queueStartExpiryError = error?.message || String(error);
		});
	}, waitMs);
	record.queueStartTimer.unref?.();
	return { deadlineAt: record.queueStartDeadlineAt, enabled: true, timeoutMs: waitMs };
}

function clear(record) {
	if (!record?.queueStartTimer) return false;
	clearTimeout(record.queueStartTimer);
	record.queueStartTimer = null;
	return true;
}

function expiryError(record = {}, waitedMs = 0) {
	const error = new Error("command_queue_start_timed_out");
	error.code = "COMMAND_QUEUE_START_TIMEOUT";
	error.consumerStarted = false;
	error.jobId = String(record.jobId || "");
	error.ownerId = String(record.ownerId || "");
	error.queueStartTimedOut = true;
	error.queueWaitMs = Math.max(0, Number(waitedMs || 0));
	return error;
}

function timeoutMs(value) {
	const raw = value ?? process.env.AWTSMOOS_COMMAND_QUEUE_START_MS;
	if (raw === undefined || raw === null || String(raw).trim() === "") return DEFAULT_TIMEOUT_MS;
	const requested = Number(raw);
	if (!Number.isFinite(requested) || requested <= 0) return 0;
	return Math.max(MIN_TIMEOUT_MS, Math.min(MAX_TIMEOUT_MS, Math.floor(requested)));
}

module.exports = {
	DEFAULT_TIMEOUT_MS,
	MAX_TIMEOUT_MS,
	MIN_TIMEOUT_MS,
	arm,
	clear,
	expiryError,
	timeoutMs
};
