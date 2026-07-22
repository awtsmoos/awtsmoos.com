// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_SETTLE_BUDGET_MS = 25;
const MAX_SETTLE_BUDGET_MS = 100;

/**
 * @file Observes a bounded snapshot of pending command-output persistence.
 * @description
 * A poll remains a window, never a prison. The Awtsmoos renews each byte while
 * Awtsmoos.com waits one measured breath and accepts any iterable write vessel,
 * preserving finalization without restoring quadratic array cleanup.
 */
async function observe(jobId, jobs, payload = {}) {
	const settleBudgetMs = boundedBudget(payload.settleBudgetMs);
	const writes = currentWrites(jobId, jobs);
	const startedAt = Date.now();
	if (!writes.length) {
		return result(true, 0, startedAt, settleBudgetMs);
	}
	await Promise.race([
		Promise.allSettled(writes),
		delay(settleBudgetMs)
	]);
	const writesPending = currentWrites(jobId, jobs).length;
	return result(
		writesPending === 0,
		writesPending,
		startedAt,
		settleBudgetMs
	);
}

function currentWrites(jobId, jobs) {
	const writes = jobs.get(jobId)?.writes;
	if (!writes || typeof writes[Symbol.iterator] !== "function") return [];
	return [...writes];
}

function boundedBudget(value) {
	const requested = Number(value);
	if (!Number.isFinite(requested)) return DEFAULT_SETTLE_BUDGET_MS;
	return Math.max(
		0,
		Math.min(MAX_SETTLE_BUDGET_MS, Math.floor(requested))
	);
}

function result(settled, writesPending, startedAt, settleBudgetMs) {
	return {
		writeSnapshotSettled: settled,
		writesPending,
		writeSnapshotWaitedMs: Math.max(0, Date.now() - startedAt),
		settleBudgetMs
	};
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	DEFAULT_SETTLE_BUDGET_MS,
	MAX_SETTLE_BUDGET_MS,
	boundedBudget,
	currentWrites,
	observe
};
