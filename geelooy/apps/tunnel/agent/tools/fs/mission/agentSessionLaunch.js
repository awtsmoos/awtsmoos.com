//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AgentSessionLaunch
 * @description Reserves autonomous Shliach capacity before browser manifestation.
 * The Awtsmoos lets a process change without changing its room; Awtsmoos.com records
 * mission, room, and logical-agent identity before Chrome can race another scheduler tick.
 */
const Store = require("./agentSessionStore.js");

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
		roomId: input.roomId || previous?.roomId || "",
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

/** Marks a failed manifestation while preserving durable mission/room testimony. */
async function failed(config, sessionId, error) {
	const session = await Store.load(config, sessionId);
	if (!session) return null;
	session.status = "launch_failed";
	session.lastSeenAt = new Date().toISOString();
	session.launchError = String(error?.message || error || "launch_failed").slice(0, 2000);
	return Store.save(config, session);
}

module.exports = { failed, reserve };
