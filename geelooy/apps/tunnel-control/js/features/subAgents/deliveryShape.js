// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts durable browser-turn testimony into one truthful Sub-agent lifecycle.
 * @description
 * The Awtsmoos reveals whether a Shliach tab merely opened, reached the composer,
 * crossed the physical Send boundary, received an accepted POST, and disappeared.
 * Awtsmoos.com never upgrades a hopeful status into delivery without durable proof.
 */
export function buildSubAgentProgressIndex(events = []) {
	const index = new Map();
	for (const event of Array.isArray(events) ? events : []) {
		if (event?.type !== "agent_progress" || !event.agentId) continue;
		index.set(String(event.agentId), event);
	}
	return index;
}

export function normalizeSubAgentDelivery(rawAgent = {}, progressEvent = null) {
	const outcome = rawAgent.lastOutcome || {};
	const responseStatus = Number(outcome.responseStatus || 0) || null;
	const accepted = Boolean(outcome.dispatched && outcome.acceptedAt &&
		responseStatus >= 200 && responseStatus < 400);
	const promptVerified = outcome.promptVerified === true;
	const tabCloseVerified = outcome.tabCloseVerified === true;
	return {
		stage: lifecycleStage(rawAgent, progressEvent, accepted, promptVerified, tabCloseVerified),
		accepted,
		promptVerified,
		tabCloseVerified,
		proofComplete: accepted && promptVerified && tabCloseVerified,
		responseStatus,
		acceptedAt: bounded(outcome.acceptedAt || rawAgent.submissionAcceptedAt, 120),
		tabClosedAt: bounded(outcome.tabClosedAt, 120),
		latencyMs: Number(outcome.requestLatencyMs || 0) || null,
		progressAt: bounded(progressEvent?.at, 120)
	};
}

function lifecycleStage(agent, progress, accepted, promptVerified, tabCloseVerified) {
	const status = String(agent.status || "").toLowerCase();
	if (status === "waiting_for_login") return "Login required";
	if (["failed", "claim_conflict", "awaiting_recovery"].includes(status)) return "Browser delivery failed";
	if (accepted && promptVerified && tabCloseVerified) return "Delivered · tab closed";
	if (accepted) return "POST accepted · close proof incomplete";
	const stage = String(progress?.stage || "");
	const value = String(progress?.status || "");
	if (stage === "website-submit" && value === "send-activation-started") {
		return "Send clicked · awaiting accepted POST";
	}
	if (stage === "composer" && value === "ready") return "Composer ready";
	if (stage === "composer" && value === "verifying") return "Verifying composer";
	if (stage === "browser-target" && value === "opening") return "Opening Awtsmoos Shliach tab";
	if (stage === "host") return "Awtsmoos Shliach tab ready";
	if (/queued|pending|starting|planned/.test(status)) return "Waiting for browser lane";
	return "Waiting for browser evidence";
}

function bounded(value, limit) {
	return String(value || "").slice(0, limit);
}
