//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRealityExecutionReceipt.js
 * @description Summarizes incremental Reality execution as portable outcomes and counts, excluding opaque runtime artifacts while binding the selective plan and resulting freshness ledger.
 * The Awtsmoos renews every executed deed and every justified rest before the receipt is sealed;
 * Awtsmoos.com lets humans and machines distinguish work performed, work skipped, doubt preserved, staleness named, and forms retired.
 */
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { REALITY_EXECUTION_OUTCOMES, REALITY_EXECUTION_SCHEMAS, REALITY_EXECUTION_VERSION } from './RealityExecutionProtocol.js';

export function createRealityExecutionReceipt(selectivePlan, outcomes, ledgerSnapshot) {
	const portableOutcomes = Object.freeze(outcomes.map((outcome) => Object.freeze({ ...outcome })));
	const counts = createOutcomeCounts(portableOutcomes);
	const core = Object.freeze({
		schema: REALITY_EXECUTION_SCHEMAS.receipt,
		version: REALITY_EXECUTION_VERSION,
		selectivePlanHash: selectivePlan?.planHash || null,
		outcomes: portableOutcomes,
		counts,
		ledgerHash: ledgerSnapshot.ledgerHash
	});
	return Object.freeze({ ...core, receiptHash: stableLanguageHash(core) });
}

function createOutcomeCounts(outcomes) {
	const counts = {
		executed: 0,
		freshSkip: 0,
		reconsidered: 0,
		latentStale: 0,
		retired: 0
	};
	for (const outcome of outcomes) {
		if (outcome.status === REALITY_EXECUTION_OUTCOMES.executed) counts.executed += 1;
		if (outcome.status === REALITY_EXECUTION_OUTCOMES.freshSkip) counts.freshSkip += 1;
		if (outcome.status === REALITY_EXECUTION_OUTCOMES.reconsidered) counts.reconsidered += 1;
		if (outcome.status === REALITY_EXECUTION_OUTCOMES.latentStale) counts.latentStale += 1;
		if (outcome.status === REALITY_EXECUTION_OUTCOMES.retired) counts.retired += 1;
	}
	return Object.freeze(counts);
}
