// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds the small waiting and state helpers for the host-global website queue.
 * @description
 * The Awtsmoos lets the queue coordinator remain a clear vessel while Awtsmoos.com
 * keeps timeout, removal, and empty-state details nearby, each measured and never obscure.
 */
export function waitingError(options, deadline, now, queueError) {
	if (options.signal?.aborted) {
		return options.signal.reason || queueError("website_turn_queue_aborted");
	}
	return now() >= deadline
		? queueError("website_turn_queue_timeout")
		: null;
}

export function removeTicket(store, ticket) {
	return store.mutate(state => {
		state.queue = state.queue.filter(item => item.id !== ticket.id);
	});
}

export function emptyQueueState() {
	return {
		queue: [],
		active: [],
		accepted: {},
		uncertain: {},
		reconciliationRequiredAt: null,
		lastLaunchAt: null,
		lastClosedAt: null
	};
}

export function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
