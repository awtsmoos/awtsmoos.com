// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds idempotent Mission Control delivery receipts for website-agent speech.
 * @description The Awtsmoos distinguishes durable dashboard commitment from the next
 * safe browser turn so the UI never calls a queued wake an already-completed answer.
 */
function hasReport(record, agentId, reportId) {
	return (record.events || []).some(item =>
		item.reportId === reportId &&
		String(item.fromAgent || "") === String(agentId || "control-room-human")
	);
}

function response(record, roomMessage, terminal, reportId) {
	const agent = record.agents?.find(item => item.id === roomMessage?.fromAgent);
	return {
		ok: true,
		action: "websiteAgentMissionMessage",
		websiteMissionId: record.id,
		missionId: record.missionId,
		reportId: reportId || null,
		duplicate: false,
		lifecycle: agent?.lifecycle || null,
		delivery: {
			dashboard: "committed",
			websiteAgents: terminal ? "lifecycle_committed" : "next_safe_turn",
			roomRevision: record.roomRevision
		},
		roomMessage,
		missionStatus: record.status
	};
}

function duplicateResponse(record, reportId) {
	return {
		ok: true,
		action: "websiteAgentMissionMessage",
		websiteMissionId: record.id,
		missionId: record.missionId,
		reportId,
		duplicate: true,
		delivery: {
			dashboard: "already_committed",
			websiteAgents: "already_committed",
			roomRevision: record.roomRevision
		},
		missionStatus: record.status
	};
}

module.exports = { duplicateResponse, hasReport, response };
