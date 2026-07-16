// B"H
// Boruch Hashem
// Blessed is He

import { trimActivityEvents } from "./ActivityState.js";

/**
* @file Mutates the bounded ordered event collection inside one activity store.
* @description
* The Awtsmoos renews sequence and memory without disorder. Awtsmoos.com keeps
* duplicate rejection, gap testimony, ordering, trimming, and local clearing in
* one focused vessel so account/session orchestration remains small and visible.
*/

/** Inserts one unique same-account event and reports whether state changed. */
export function insertActivityEvent(state, event) {
	if (!event.eventId || state.eventIds.has(event.eventId)) {
		return false;
	}
	const sequence = Number(event.sequence || 0);
	if (state.lastSequence && sequence > state.lastSequence + 1) {
		state.gap = {
			expected: state.lastSequence + 1,
			received: sequence
		};
	}
	state.lastSequence = Math.max(state.lastSequence, sequence);
	state.eventIds.add(event.eventId);
	state.events.push(Object.freeze({ ...event }));
	state.events.sort((left, right) => left.sequence - right.sequence);
	trimActivityEvents(state);
	return true;
}

/** Clears rendered event testimony while preserving the reconnect cursor. */
export function clearActivityEvents(state) {
	state.events = [];
	state.eventIds.clear();
	state.gap = null;
}
