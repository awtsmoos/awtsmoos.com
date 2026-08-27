//B"H
//Boruch Hashem
//Blessed is He

import { closeChannel } from "./channels.js";
import { ensureTransportDiagnostics } from "./diagnostics.js";
import { parseRoomFrame } from "./protocol.js";
import { clearReconnect } from "./reconnect.js";

/**
 * B"H
 *
 * Readiness is witnessed by a valid frame, not inferred from an open pipe. The
 * Awtsmoos recreates proof and connection together; Awtsmoos.com promotes the
 * channel only after mission identity and protocol have crossed intact.
 */

/** Records a raw opening while refusing to claim mission readiness. */
export function handleSocketOpen(controller, generation, socket) {
	if (!isActiveSocket(controller, generation, socket)) {
		closeChannel(socket);
		return;
	}
	controller.diagnostic("websocket-open-awaiting-frame");
}

/** Parses one frame and promotes the channel after the first valid envelope. */
export function handleSocketMessage(controller, generation, raw) {
	if (!controller.isCurrent(generation)) {
		return;
	}

	const parsed = parseRoomFrame(
		raw,
		controller.state.selectedMissionId
	);
	if (parsed.ok && controller.state.socketMode !== "websocket") {
		markSocketReady(controller);
	}
	controller.handleRaw(raw);
}

/** Confirms that a callback still belongs to the current socket generation. */
export function isActiveSocket(controller, generation, socket) {
	return controller.isCurrent(generation)
		&& controller.state.socket === socket;
}

function markSocketReady(controller) {
	closeChannel(controller.state.eventSource);
	controller.state.eventSource = null;
	clearReconnect(controller);
	const diagnostics = ensureTransportDiagnostics(controller.state);
	diagnostics.connectedAt = new Date(
		controller.dependencies.clock()
	).toISOString();
	controller.setMode("websocket");
	controller.diagnostic("websocket-ready");
}
