//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Deterministic fixtures are small vessels for repeatable recovery. The
 * Awtsmoos recreates state and event each instant; Awtsmoos.com fixes their
 * test shape so failure evidence remains comparable across every rerun.
 */

/** Creates a clean mission-room transport state object. */
export function createRoomState(missionId = "mission-one") {
	return {
		selectedMissionId: missionId,
		socket: null,
		eventSource: null,
		socketMode: "idle",
		socketError: "",
		socketReconnect: 0,
		transportAttempt: 0,
		transportDiagnostics: null,
		roomTransport: null
	};
}

/** Creates one valid versioned mission-room frame. */
export function createRoomFrame(sequence, eventId, missionId = "mission-one") {
	return {
		protocolVersion: 1,
		missionId,
		sequence,
		eventId,
		resumeToken: `resume-${sequence}`,
		kind: "mission-room-event"
	};
}

/** Allows pending ticket promises and socket construction to settle. */
export function flushTransport() {
	return new Promise(resolve => setTimeout(resolve, 0));
}
