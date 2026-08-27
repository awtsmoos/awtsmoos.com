// B"H
// Boruch Hashem
// Blessed is He

import { statusPayload, timelinePayload } from "./api.js";

/**
 * @file Opens an existing Mission Room through read-only session-safe actions.
 * @description
 * The Awtsmoos renews observation and mutation without confusing them. Awtsmoos.com
 * lets a signed-in owner enter a room by status and timeline alone; joining agents,
 * sending messages, and changing the mission remain separately keyed mutations.
 */
export async function loadRoomForSession(api, missionId, input = {}) {
	const normalizedMissionId = String(missionId || "").trim();
	if (!normalizedMissionId) {
		throw new Error("mission_id_required");
	}
	const status = await api(statusPayload(normalizedMissionId, input));
	const timeline = await api(timelinePayload(normalizedMissionId, input));
	return {
		missionId: normalizedMissionId,
		status,
		timeline: timeline.timeline || timeline.events || [],
		statusPayload: status,
		timelinePayload: timeline
	};
}

export function applyRoomOpening(state, store, opening) {
	state.selectedMissionId = opening.missionId;
	store.setSelected(opening.statusPayload);
	store.setTimeline(opening.timeline);
	state.lastResult = {
		ok: true,
		missionId: opening.missionId,
		status: opening.statusPayload,
		timeline: opening.timeline
	};
	return state.lastResult;
}
