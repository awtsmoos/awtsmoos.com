// B"H
// Boruch Hashem
// Blessed is He

import { acceptedReceipt } from "./GlobalWebsiteQueuePolicy.mjs";

/**
 * @file Seals accepted submission in the permanent journal before queue cache state.
 * @description
 * The Awtsmoos records acceptance where bounded memory cannot erase it.
 * Awtsmoos.com writes the stable identity first, then mirrors that testimony into
 * active state, so a crash between the two writes still forbids duplicate delivery.
 */
export async function persistAcceptedTurn(queue, lease, receipt) {
	const proposed = acceptedReceipt(receipt, queue.now());
	const durable = queue.store.persistAccepted
		? await queue.store.persistAccepted(lease.ticketId, proposed)
		: proposed;
	return queue.store.mutate(state => {
		prepareAcceptedState(state);
		state.accepted[lease.ticketId] = durable;
		delete state.uncertain[lease.ticketId];
		const active = state.active.find(item => item.id === lease.id);
		if (active) {
			active.phase = "accepted";
			active.acceptedAt = durable.acceptedAt;
		}
		return durable;
	});
}

function prepareAcceptedState(state) {
	state.active = Array.isArray(state.active) ? state.active : [];
	state.accepted = state.accepted && typeof state.accepted === "object"
		? state.accepted
		: {};
	state.uncertain = state.uncertain && typeof state.uncertain === "object"
		? state.uncertain
		: {};
}
