// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Decides which filesystem actions may be retried after worker death or timeout.
 * @description
 * The Awtsmoos never repeats a deed that may have already changed the world.
 * Awtsmoos.com therefore retries only an EXPLICIT allowlist of read-only actions,
 * once, after FS_EXECUTOR_EXITED or FS_EXECUTOR_TIMEOUT. Everything else —
 * every write, every unknown action — is default-deny: misclassifying a write as
 * retryable would double its effects, which is the catastrophic case this file
 * exists to prevent.
 *
 * Read-only action names below are the real registry names:
 * - filesystem reads: tools/fs/actionGroups/readActions.js
 * - batch read ops: tools/fs/bulkRead.js, tools/fs/pagedSearch.js
 * - command observation verbs: tools/fs/actionGroups/commandActions.js
 *   (the cancel verbs are deliberately absent)
 * - executorTest* doubles that behave like reads
 */
const READ_ONLY_ACTIONS = new Set([
	// Filesystem reads (verified against readActions.js).
	"stat",
	"list",
	"tree",
	"read",
	"readLines",
	"readManyLines",
	"readBytes",
	"read64",
	"md",
	"bulk",
	"grep",
	"rg",
	"find",
	"bulkSearch",
	"selectString",
	"findFiles",
	"fileHashes",
	"astOutline",
	"symbolOutline",
	"connectedFiles",
	// Batch read operations.
	"bulkRead",
	"pagedSearch",
	// Command observation verbs (never the cancel verbs).
	"commandStatus",
	"commandPoll",
	"commandWait",
	"commandJobStatus",
	"commandJobWait",
	"commandJobOutputPage",
	"commandOutputPage",
	// Executor test doubles that behave like reads.
	"executorTestFamily",
	"executorTestBlock",
	"executorTestProgress",
	"executorTestCancellable"
]);

const RETRYABLE_CODES = new Set([
	"FS_EXECUTOR_EXITED",
	"FS_EXECUTOR_TIMEOUT"
]);

/** True only for actions on the explicit read-only allowlist. Default deny. */
function isRetryableAction(action) {
	return READ_ONLY_ACTIONS.has(String(action || ""));
}

/** True only for worker-death / running-timeout terminal codes. */
function isRetryableCode(code) {
	return RETRYABLE_CODES.has(String(code || ""));
}

/**
 * True when a job may be requeued once after a destructive worker failure.
 * Cancelled jobs never retry: a cancel is a caller decision, not a failure.
 * A job that already used its one retry never retries again — the second
 * identical failure is the poison signal and must reject + feed the family
 * circuit instead of looping.
 */
function shouldRetry(job, code) {
	if (!job || job.cancelRequested) return false;
	if (Number(job.retryCount || 0) >= 1) return false;
	if (!isRetryableCode(code)) return false;
	return isRetryableAction(job.payload && job.payload.action);
}

module.exports = {
	isRetryableAction,
	isRetryableCode,
	shouldRetry
};
