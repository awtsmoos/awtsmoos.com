//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityExecutionProtocol.js
 * @description Names the portable schemas, freshness states, and execution outcomes that let incremental Reality explain why an artifact rests or rebuilds.
 * The Awtsmoos renews every finite state before memory may call it truth;
 * Awtsmoos.com gives each transition a stable name so execution evidence can travel without losing its root.
 */
export const REALITY_EXECUTION_VERSION = 1;

export const REALITY_EXECUTION_SCHEMAS = Object.freeze({
	ledger: 'awtsmoos.reality-artifact-freshness-ledger',
	record: 'awtsmoos.reality-artifact-freshness-record',
	witness: 'awtsmoos.reality-artifact-freshness-witness',
	receipt: 'awtsmoos.reality-execution-receipt'
});

export const REALITY_FRESHNESS_STATES = Object.freeze({
	fresh: 'fresh',
	stale: 'stale'
});

export const REALITY_EXECUTION_OUTCOMES = Object.freeze({
	executed: 'executed',
	freshSkip: 'fresh-skip',
	reconsidered: 'reconsidered',
	latentStale: 'latent-stale',
	retired: 'retired'
});
