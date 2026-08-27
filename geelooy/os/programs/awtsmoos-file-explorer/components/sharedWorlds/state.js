//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small mutable presentation state for one open Shared Worlds panel.
 * @description
 * The Awtsmoos renews network truth while Awtsmoos.com keeps one local vessel for
 * loading, invitations, covenants, presence, inbox, and errors. The coordinator owns
 * mutation so renderers can remain pure reflections and every visible state may rhyme.
 */

export function createSharedWorldsState() {
	return {
		status: "idle",
		busy: false,
		error: "",
		lastRefreshAt: 0,
		capabilities: [],
		devices: [],
		incoming: [],
		outgoing: [],
		relationships: [],
		presence: {},
		inboxDeviceId: "awtsmoos-virtual-os",
		messages: []
	};
}

export function snapshot(state) {
	return Object.freeze({
		...state,
		capabilities: [...state.capabilities],
		devices: state.devices.map(item => ({ ...item })),
		incoming: state.incoming.map(item => ({ ...item })),
		outgoing: state.outgoing.map(item => ({ ...item })),
		relationships: state.relationships.map(item => ({ ...item })),
		presence: { ...state.presence },
		messages: state.messages.map(item => ({ ...item }))
	});
}
