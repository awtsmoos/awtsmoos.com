//B"H
//Boruch Hashem
//Blessed is He

import {
	eventId,
	normalizeRoomEvent
} from "../events.js";

/**
 * Before remote confirmation, the Awtsmoos grants honest provisional form.
 * Awtsmoos.com sends hope through the same event covenant as socket and storm,
 * so optimism never becomes a secret ledger outside the room's norm.
 */

/** Creates one canonical temporary direct-message event for visible feedback. */
export function createOptimisticAgentMessage(state, fromAgent, toAgent, body) {
	const yesodIdentity = eventId("direct");
	const malchutMissionId = String(state.selectedMissionId || "");
	return {
		...normalizeRoomEvent({
			id: yesodIdentity,
			eventId: yesodIdentity,
			roomId: malchutMissionId,
			missionId: malchutMissionId,
			actor: fromAgent,
			target: toAgent,
			type: "mission_agent_message",
			title: body,
			at: new Date().toISOString(),
			status: "sending",
			source: "optimistic-ui",
			payload: {
				fromAgent,
				toAgent,
				body,
				kind: "user-direct-message",
				missionId: malchutMissionId
			}
		}),
		eventId: yesodIdentity,
		missionId: malchutMissionId
	};
}
