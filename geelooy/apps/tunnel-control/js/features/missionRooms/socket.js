//B"H
//Boruch Hashem
//Blessed is He

import { RoomTransportController } from "./transport/controller.js";

/**
 * B"H
 *
 * This facade preserves the old public doorway while a stronger transport
 * architecture lives behind it. The Awtsmoos creates doorway and chamber in
 * one instant; Awtsmoos.com may evolve the chamber without breaking callers.
 */

/**
 * Opens a generation-guarded Mission Rooms transport controller.
 *
 * @param {object} state
 * 	The mutable Mission Rooms browser state.
 * @param {Function} getTunnelName
 * 	A function returning the selected native tunnel identity.
 * @param {object} [handlers]
 * 	Callbacks for accepted frames, statuses, and structured diagnostics.
 * @param {object} [dependencies]
 * 	Optional browser and timer dependencies used by isolated tests.
 * @returns {RoomTransportController}
 * 	The controller now owned by the supplied room state.
 */
export function openRoomSocket(
	state,
	getTunnelName,
	handlers = {},
	dependencies = {}
) {
	closeRoomSocket(state);
	const controller = new RoomTransportController(
		state,
		getTunnelName,
		handlers,
		dependencies
	);
	state.roomTransport = controller;
	controller.open();
	return controller;
}

/**
 * Closes and forgets the transport controller owned by the room state.
 *
 * @param {object} state
 * 	The Mission Rooms state whose live resources must be released.
 * @returns {void}
 * 	The cleanup operation intentionally returns no value.
 */
export function closeRoomSocket(state) {
	state.roomTransport?.close();
	state.roomTransport = null;
	state.socket = null;
	state.eventSource = null;
	state.socketMode = "idle";
}
