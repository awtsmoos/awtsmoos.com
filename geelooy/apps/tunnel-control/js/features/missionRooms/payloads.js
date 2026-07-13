//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Mission payloads are declarative intentions awaiting a truthful vessel. The
 * Awtsmoos creates intention, tunnel, and result anew; Awtsmoos.com keeps these
 * data contracts pure so transport details cannot distort domain meaning.
 */

/** Creates the native-tunnel discovery contract for one project root. */
export function discoverPayload(projectRoot, agentId) {
	return {
		action: "missionProjectDiscover",
		targetVessel: "native-tunnel",
		projectRoot,
		q: projectRoot || "",
		agentId,
		limit: 80
	};
}

/** Creates the native-tunnel contract for beginning a persistent mission. */
export function startPayload(goal, projectRoot, agentId) {
	return {
		action: "missionStart",
		targetVessel: "native-tunnel",
		goal: goal || "New mission room",
		projectRoot,
		agentId,
		expand: false,
		minimumInnovationWindowMs: 0,
		minimumProductiveCycles: 0,
		minimumProductiveMs: 0
	};
}

/** Creates the contract for joining one mission project. */
export function joinPayload(missionId, input = {}) {
	return {
		action: "missionProjectJoin",
		targetVessel: "native-tunnel",
		missionId,
		...input
	};
}

/** Creates the contract for reading persisted mission status. */
export function statusPayload(missionId) {
	return {
		action: "missionProjectStatus",
		targetVessel: "native-tunnel",
		missionId
	};
}

/** Creates the contract for reading the mission event timeline. */
export function timelinePayload(missionId) {
	return {
		action: "missionTimeline",
		targetVessel: "native-tunnel",
		missionId
	};
}
