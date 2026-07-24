// B"H
// Boruch Hashem
// Blessed is He

const {
	scopedPayload,
	summarizeRoomOs
} = require("./roomSummary.js");

/**
 * @file Reads a mission-room snapshot through an already authorized relay closure.
 * @description
 * The Awtsmoos renews mission and witness together. Awtsmoos.com accepts no
 * tunnel name at this layer: the caller supplies one server-derived relay vessel,
 * preventing snapshot, timeline, or history requests from widening authority.
 */

async function readMissionRoomSnapshot(sendAuthorized, options) {
	const scope = scopedPayload(options);
	const [status, timelineResult, historyResult] = await Promise.all([
		requestAction(sendAuthorized, {
			action: "missionProjectStatus",
			missionId: options.missionId
		}),
		requestAction(sendAuthorized, {
			action: "missionTimeline",
			missionId: options.missionId
		}),
		requestAction(sendAuthorized, {
			action: "actionHistoryList",
			limit: options.historyLimit,
			...scope
		})
	]);
	if (!status || status.ok === false || status.error) {
		return packet(false, {
			error: "mission_unreachable",
			missionId: options.missionId,
			status: status || null
		});
	}
	const timeline = Array.isArray(timelineResult?.timeline)
		? timelineResult.timeline
		: [];
	const history = Array.isArray(historyResult?.history)
		? historyResult.history
		: [];
	return packet(true, {
		kind: "mission-room-snapshot",
		missionId: options.missionId,
		roomId: options.roomId || options.missionId,
		scopedHistory: scope,
		at: Date.now(),
		status,
		timeline,
		actionHistory: history,
		roomOs: summarizeRoomOs(history, timeline, status),
		warnings: warningList(timelineResult, historyResult)
	});
}

async function requestAction(sendAuthorized, payload) {
	try {
		return await sendAuthorized({
			targetVessel: "native-tunnel",
			p: ".",
			...payload
		});
	} catch (error) {
		return {
			ok: false,
			error: error.message,
			action: payload.action
		};
	}
}

function warningList(timelineResult, historyResult) {
	return [
		timelineResult?.ok === false || timelineResult?.error
			? "timeline_unavailable"
			: "",
		historyResult?.ok === false || historyResult?.error
			? "history_unavailable"
			: ""
	].filter(Boolean);
}

function packet(ok, extra = {}) {
	return { BH: "B\"H", ok, ...extra };
}

module.exports = {
	readMissionRoomSnapshot
};
