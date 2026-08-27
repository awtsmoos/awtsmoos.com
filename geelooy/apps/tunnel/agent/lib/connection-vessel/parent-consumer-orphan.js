// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Detects stale parent custody that exceeds every living execution vessel.
 * @description
 * The Awtsmoos renews each deed in its proper instant. Awtsmoos.com therefore
 * protects custody matched by living execution while refusing to let one living
 * worker conceal a field of abandoned receipts. Age supplies patience; excess
 * supplies proof; repair remains the responsibility of the generation watchdog.
 */

const DEFAULT_ORPHAN_MULTIPLIER = 2;

/**
 * Judges generation-local custody without inferring record identity from counts.
 *
 * @param {object} stats Aggregate queue and executor statistics.
 * @param {object} custody Generation-local custody evidence.
 * @param {object} stages Aggregate execution-stage evidence.
 * @param {number} consumerStaleMs Base consumer-staleness threshold.
 * @param {number} [configuredStaleMs] Optional orphan confirmation threshold.
 * @returns {object} Explainable stale-excess custody evidence.
 */
function inspect(stats = {}, custody = {}, stages = {}, consumerStaleMs = 30000, configuredStaleMs) {
	const orphanStaleMs = staleThreshold(consumerStaleMs, configuredStaleMs);
	const trackedExecution = trackedExecutionCount(stats, stages);
	const custodyCount = nonnegative(custody.count);
	const custodyAgeMs = nonnegative(custody.oldestAgeMs);
	const orphanedCustodyCount = Math.max(0, custodyCount - trackedExecution);
	const custodyIsOld = custody.aware === true && custodyAgeMs >= orphanStaleMs;
	const orphanedCustody = custodyIsOld && orphanedCustodyCount > 0;

	return {
		orphanedCustody,
		orphanedCustodyCount,
		orphanedCustodyAgeMs: custodyAgeMs,
		orphanStaleMs,
		trackedExecution
	};
}

/** Counts current execution vessels that may legitimately own accepted work. */
function trackedExecutionCount(stats = {}, stages = {}) {
	const executor = stats.filesystemExecutor || {};
	const laneWork = nonnegative(stats.queued) + nonnegative(stats.inflight);
	const stageWork = nonnegative(stages.active);
	const executorWork = nonnegative(executor.busy) + nonnegative(executor.queued);

	return Math.max(laneWork, stageWork, executorWork);
}

/** Keeps orphan recovery slower than ordinary consumer-stall detection. */
function staleThreshold(consumerStaleMs, configuredStaleMs) {
	const base = Math.max(1000, nonnegative(consumerStaleMs) || 30000);
	const configured = Number(configuredStaleMs);

	if (Number.isFinite(configured) && configured >= base) {
		return Math.floor(configured);
	}

	return base * DEFAULT_ORPHAN_MULTIPLIER;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	DEFAULT_ORPHAN_MULTIPLIER,
	inspect,
	staleThreshold,
	trackedExecutionCount
};
