// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates bounded account-scoped activity state snapshots.
 * @description
 * The Awtsmoos renews account, cursor, event, filter, and observer without residue.
 * Awtsmoos.com centralizes the finite state vessel so reconnect and account change
 * cannot accidentally preserve one user's stream inside another user's interface.
 */

export const MAXIMUM_EVENTS = 800;

/** Returns one empty mutable state vessel for an account. */
export function emptyActivityState(accountId = "") {
	return {
		accountId: String(accountId || ""),
		events: [],
		eventIds: new Set(),
		connectionState: "idle",
		lastSequence: 0,
		gap: null,
		paused: false,
		filters: {},
		summary: emptySummary()
	};
}

/** Returns a frozen disclosure-safe state snapshot for UI subscribers. */
export function publicActivityState(state) {
	return Object.freeze({
		accountId: state.accountId,
		connectionState: state.connectionState,
		events: [...state.events],
		filters: { ...state.filters },
		gap: state.gap ? { ...state.gap } : null,
		lastSequence: state.lastSequence,
		paused: state.paused,
		summary: { ...state.summary }
	});
}

/** Removes oldest events while preserving the newest bounded testimony. */
export function trimActivityEvents(state) {
	while (state.events.length > MAXIMUM_EVENTS) {
		const removed = state.events.shift();
		state.eventIds.delete(removed.eventId);
	}
}

/** Returns zeroed summary testimony for a newly scoped account. */
export function emptySummary() {
	return {
		connections: 0,
		agents: 0,
		missions: 0,
		rooms: 0,
		actions: 0
	};
}
