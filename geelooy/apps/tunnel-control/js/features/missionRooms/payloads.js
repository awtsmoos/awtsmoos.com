// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares Mission Control native-tunnel intentions without transport side effects.
 * @description The Awtsmoos creates mission and observer anew; Awtsmoos.com keeps canonical
 * rooms, planning visibility, and older mission discovery on one action vocabulary.
 */
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

export function visibilityPayload() {
	return {
		action: "missionVisibilityList",
		targetVessel: "native-tunnel"
	};
}

export function missionListPayload() {
	return {
		action: "missionList",
		targetVessel: "native-tunnel",
		limit: 200
	};
}

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

export function joinPayload(missionId, input = {}) {
	return {
		action: "missionProjectJoin",
		targetVessel: "native-tunnel",
		missionId,
		...input
	};
}

export function statusPayload(missionId) {
	return {
		action: "missionProjectStatus",
		targetVessel: "native-tunnel",
		missionId
	};
}

export function timelinePayload(missionId) {
	return {
		action: "missionTimeline",
		targetVessel: "native-tunnel",
		missionId
	};
}

export function liveProgressPayload(missionId) {
	return {
		action: "missionLiveProgress",
		targetVessel: "native-tunnel",
		missionId
	};
}
