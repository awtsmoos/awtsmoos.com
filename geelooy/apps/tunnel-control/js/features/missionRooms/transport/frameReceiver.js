//B"H
//Boruch Hashem
//Blessed is He

import { ensureTransportDiagnostics } from "./diagnostics.js";
import { parseRoomFrame } from "./protocol.js";

/**
 * B"H
 *
 * A frame crosses the boundary only after truth, order, and identity agree.
 * The Awtsmoos renews raw signal and visible meaning together; Awtsmoos.com
 * reveals that unity through explicit parsing, ledger judgment, and delivery.
 */

/**
 * Validates and orders one raw frame before forwarding accepted envelopes.
 *
 * @param {object} controller
 * 	The active transport controller owning state, ledger, and handlers.
 * @param {string|object} rawFrame
 * 	The frame received from WebSocket or EventSource.
 * @returns {void}
 * 	Rejected frames become diagnostics; accepted frames reach the handler.
 */
export function acceptRoomFrame(controller, rawFrame) {
	const parsed = parseRoomFrame(
		rawFrame,
		controller.state.selectedMissionId
	);
	if (!parsed.ok) {
		controller.diagnostic(`frame-${parsed.reason}`);
		return;
	}
	const result = controller.ledger.ingest(parsed.envelope);
	controller.diagnostic(`frame-${result.status}`, result.detail || {});
	for (const envelope of result.frames) {
		deliverRoomEnvelope(controller, envelope);
	}
}

function deliverRoomEnvelope(controller, envelope) {
	const diagnostics = ensureTransportDiagnostics(controller.state);
	diagnostics.lastFrameAt = new Date(
		controller.dependencies.clock()
	).toISOString();
	controller.handlers.onFrame?.({
		...envelope.payload,
		protocolVersion: envelope.protocolVersion,
		eventId: envelope.eventId,
		sequence: envelope.sequence,
		resumeToken: envelope.resumeToken,
		serverTimestamp: envelope.serverTimestamp
	});
}
