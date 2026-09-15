//B"H
// Boruch Hashem
// Blessed is He

const RecoveryContext = require("./recoveryContext.js");

/**
 * @file Applies explicit debt or proactive pool custody only when ordinary recovery has none.
 * @description The Awtsmoos lets one mission reveal the next messenger without inventing new
 * work; Awtsmoos.com gives debt and pool recovery deterministic leases through one narrow gate.
 */
function applyFallbackLease(deps, mission, recovery, debt, fingerprint, options, recoveryOptions) {
	if (recovery.taskLease) return recovery;
	const lease = options.proactive
		? deps.ProactivePoolLease.build(
			mission,
			recovery,
			debt,
			fingerprint,
			options.poolSlot,
			options.poolRole
		)
		: deps.DebtRecoveryLease.build(mission, recovery, debt, fingerprint);
	return lease
		? RecoveryContext.build(mission, fingerprint, {
			...recoveryOptions,
			fallbackTaskLease: lease
		})
		: recovery;
}

module.exports = { applyFallbackLease };
