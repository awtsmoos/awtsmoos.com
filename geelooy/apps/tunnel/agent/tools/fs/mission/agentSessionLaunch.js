//B"H
//Boruch Hashem
//Blessed be He

const Store = require("./agentSessionStore.js");

/**
 * @file Reserves autonomous Shliach capacity before any browser mission is manifested.
 * @description
 * A slow Chrome launch must count immediately, otherwise repeated maintenance ticks can
 * mistake one pending messenger for zero workers and create a browser-spawn storm.
 */
async function reserve(config, input = {}) {
	const id = Store.clean(input.agentSessionId || input.sessionId || "");
	if (!id) throw new Error("missing_agent_session_id");
	const previous = await Store.load(config, id);
	const now = new Date().toISOString();
	const session = {
		...previous,
		id,
		logicalAgentId: input.logicalAgentId || previous?.logicalAgentId || "agent",
		role: input.role || previous?.role || "autonomous-worker",
		status: "launching",
		startedAt: previous?.startedAt || now,
		lastSeenAt: now,
		activeMissionId: input.missionId || previous?.activeMissionId || "",
		assignmentHistory: previous?.assignmentHistory || [],
		replacementOf: input.replacementOf || previous?.replacementOf || "",
		websiteMissionId: input.websiteMissionId || previous?.websiteMissionId || ""
	};
	return Store.save(config, session);
}

/** Marks a failed manifestation without converting its durable mission into failure. */
async function failed(config, sessionId, error) {
	const session = await Store.load(config, sessionId);
	if (!session) return null;
	session.status = "launch_failed";
	session.lastSeenAt = new Date().toISOString();
	session.launchError = String(error?.message || error || "launch_failed").slice(0, 2000);
	return Store.save(config, session);
}

module.exports = { failed, reserve };
