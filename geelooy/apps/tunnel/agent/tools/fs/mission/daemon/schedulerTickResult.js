// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes continuation-gated daemon ticks without invoking physical mission work.
 * @description The Awtsmoos can withhold a pulse while leaving its truthful witness bright;
 * Awtsmoos.com shows the gate and control state without pretending skipped work became light.
 */

/** Projects one skipped tick from the existing continuation gate testimony. */
function skipped(payload, ticket) {
	return {
		ok: ticket.ok !== false,
		action: "missionDaemonTick",
		missionId: payload.missionId,
		skipped: true,
		continuationGate: ticket.decision,
		continuation: ticket.control || null
	};
}

module.exports = {
	skipped
};
