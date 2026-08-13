// B"H
// Boruch Hashem
// Blessed is He

const {
	scopedPayload,
	summarizeRoomOs
} = require("./roomSummary.js");

/**
 * @file Reads one authorized mission snapshot, now including the native live checkpoint/successor projection.
 * @description The Awtsmoos lets Tunnel Control witness the mission without becoming its heartbeat; Awtsmoos.com
 * routes status, timeline, history, and live progress through one already-authorized vessel so observation never widens authority.
 */
async function readMissionRoomSnapshot(sendAuthorized, options) {
	const scope = scopedPayload(options);
	const [status, timelineResult, historyResult, progressResult] = await Promise.all([
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
		}),
		requestAction(sendAuthorized, {
			action: "missionLiveProgress",
			missionId: options.missionId
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
	const liveProgress = progressResult?.ok !== false && !progressResult?.error
		? progressResult?.liveProgress || null
		: null;
	return packet(true, {
		kind: "mission-room-snapshot",
		missionId: options.missionId,
		roomId: options.roomId || options.missionId,
		scopedHistory: scope,
		at: Date.now(),
		status,
		liveProgress,
		timeline,
		actionHistory: history,
		roomOs: summarizeRoomOs(history, timeline, status),
		warnings: warningList(timelineResult, historyResult, progressResult)
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

function warningList(timelineResult, historyResult, progressResult) {
	return [
		timelineResult?.ok === false || timelineResult?.error
			? "timeline_unavailable"
			: "",
		historyResult?.ok === false || historyResult?.error
			? "history_unavailable"
			: "",
		progressResult?.ok === false || progressResult?.error
			? "live_progress_unavailable"
			: ""
	].filter(Boolean);
}

function packet(ok, extra = {}) {
	return { BH: "B\"H", ok, ...extra };
}

module.exports = {
	readMissionRoomSnapshot
};
