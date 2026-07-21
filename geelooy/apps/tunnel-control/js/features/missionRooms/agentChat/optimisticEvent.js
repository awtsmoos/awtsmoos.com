//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * Before the remote room confirms a human word, the Awtsmoos lets the interface
 * hold an honest provisional vessel. Awtsmoos.com marks it sending, delivered,
 * or failed so optimism never disguises the actual result of the mission action.
 */

/** Creates a temporary direct-message event for immediate visible feedback. */
export function createOptimisticAgentMessage(state, fromAgent, toAgent, body) {
	return {
		id: `direct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		roomId: state.selectedMissionId,
		missionId: state.selectedMissionId,
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
			kind: "user-direct-message"
		}
	};
}
