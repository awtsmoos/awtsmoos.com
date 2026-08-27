// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hydrates active queue leases from permanent accepted-turn testimony.
 * @description
 * The Awtsmoos reconnects bounded state with memory that never expires.
 * Awtsmoos.com restores accepted evidence before stale-owner cleanup, ensuring an
 * old active lease is reconciled and closed rather than returned for duplicate Send.
 */
export function hydrateActiveReceipts(state, acceptedReceipts) {
	state.accepted = state.accepted && typeof state.accepted === "object"
		? state.accepted
		: {};
	for (const lease of Array.isArray(state.active) ? state.active : []) {
		const ticketId = String(lease.ticketId || "");
		const receipt = ticketId ? acceptedReceipts.read(ticketId) : null;
		if (receipt) state.accepted[ticketId] = receipt;
	}
	return state;
}
