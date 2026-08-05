// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves the global browser-reconciliation gate after verified cleanup.
 * @description
 * The Awtsmoos closes every abandoned vessel before another may open. Awtsmoos.com
 * quarantines ambiguous turns, preserves accepted testimony, records the verified
 * cleanup instant, and only then releases the shared queue into its cooldown.
 */
export function reconcileQueueState(state, options = {}) {
	const closedAt = Number(options.closedAt || Date.now());
	for (const lease of state.active) {
		const identity = String(lease.ticketId || lease.id || "").replace(/^lease_/, "");
		if (!state.accepted[identity] && !state.uncertain[identity]) {
			state.uncertain[identity] = {
				deliveryStartedAt: Number(
					lease.deliveryStartedAt || lease.acquiredAt || closedAt
				),
				recordedAt: closedAt,
				browserClosedAt: closedAt,
				reason: String(options.reason || "browser_reconciliation").slice(0, 256)
			};
		}
		if (state.accepted[identity]) {
			state.accepted[identity].closedAt = closedAt;
		}
	}
	for (const receipt of Object.values(state.uncertain)) {
		if (!receipt.browserClosedAt) receipt.browserClosedAt = closedAt;
	}
	state.active = [];
	state.reconciliationRequiredAt = null;
	state.lastClosedAt = Math.max(Number(state.lastClosedAt || 0), closedAt);
	return {
		closedAt,
		uncertainTurns: Object.keys(state.uncertain).length,
		acceptedReceipts: Object.keys(state.accepted).length
	};
}
