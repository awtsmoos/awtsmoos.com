//B"H
//Boruch Hashem
//Blessed is He

const {
	scopedPayload,
	summarizeRoomOs
} = require("./roomSummary.js");

/**
 * B"H
 *
 * A snapshot may never glow green while its mission is absent. The Awtsmoos
 * recreates source and witness together; Awtsmoos.com therefore distinguishes
 * reachable state, partial warnings, and failure before any frame is emitted.
 */

/**
 * Reads one real mission-room snapshot through the selected tunnel.
 *
 * @param {Function} sendTunnelRequest
 * 	The authenticated server relay function.
 * @param {object} options
 * 	The normalized mission-room request values.
 * @returns {Promise<object>}
 * 	A truthful snapshot or a structured unreachable result.
 */
async function readMissionRoomSnapshot(sendTunnelRequest, options) {
	const scope = scopedPayload(options);
	const [status, timelineResult, historyResult] = await Promise.all([
		requestAction(sendTunnelRequest, options, {
			action: "missionProjectStatus",
			missionId: options.missionId
		}),
		requestAction(sendTunnelRequest, options, {
			action: "missionTimeline",
			missionId: options.missionId
		}),
		requestAction(sendTunnelRequest, options, {
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
		roomId: options.missionId,
		scopedHistory: scope,
		at: Date.now(),
		status,
		timeline,
		actionHistory: history,
		roomOs: summarizeRoomOs(history, timeline, status),
		warnings: warningList(timelineResult, historyResult)
	});
}

async function requestAction(sendTunnelRequest, options, payload) {
	try {
		return await sendTunnelRequest(options.tunnelName, {
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
	const warnings = [];
	if (timelineResult?.ok === false || timelineResult?.error) {
		warnings.push("timeline_unavailable");
	}
	if (historyResult?.ok === false || historyResult?.error) {
		warnings.push("history_unavailable");
	}
	return warnings;
}

function packet(ok, extra = {}) {
	return {
		BH: "B\"H",
		ok,
		...extra
	};
}

module.exports = {
	readMissionRoomSnapshot
};