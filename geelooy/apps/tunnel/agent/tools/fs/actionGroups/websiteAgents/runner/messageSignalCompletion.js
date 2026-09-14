// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns website-agent completion testimony independently from room wake routing.
 * @description The Awtsmoos keeps terminal truth explicit so a handoff with remaining
 * work can never masquerade as a fully completed website mission.
 */
function completeAgent(agent, input = {}) {
	const remainingWork = list(input.remainingWork || input.remaining || input.nextWork);
	const handoffPaths = list(input.handoffPaths || input.files || input.references);
	const trulyComplete = remainingWork.length === 0;
	agent.status = "complete";
	agent.lifecycle = trulyComplete ? "completed" : "completed_with_remaining_work";
	agent.intentionalFinish = true;
	agent.finishedAt = new Date().toISOString();
	agent.roomDirty = false;
	agent.pendingRoomMessages = 0;
	agent.lastOutcome = {
		complete: trulyComplete,
		intentional: true,
		lifecycle: agent.lifecycle,
		status: trulyComplete ? "COMPLETE" : "HANDOFF_REMAINING",
		reportId: String(input.reportId || "").slice(0, 200) || null,
		next: String(input.next || remainingWork[0] || "").slice(0, 2000),
		remainingWork,
		handoffPaths,
		files: list(input.files || input.references),
		roomMessage: agent.lastUpdate,
		findings: String(input.findings || input.evidence || agent.lastUpdate).slice(0, 4000),
		hasStructuredStatus: true
	};
	return agent;
}

function verified(input = {}, body = "") {
	const explicit = input.complete === true || input.complete === "true";
	if (!explicit) return false;
	return Boolean(
		String(body || input.evidence || "").trim() ||
		list(input.references).length ||
		list(input.handoffPaths).length
	);
}

function list(value) {
	if (Array.isArray(value)) {
		return value.map(item => String(item).trim()).filter(Boolean).slice(0, 100);
	}
	return String(value || "").split(/[\n,]+/)
		.map(item => item.trim()).filter(Boolean).slice(0, 100);
}

module.exports = { completeAgent, list, verified };
