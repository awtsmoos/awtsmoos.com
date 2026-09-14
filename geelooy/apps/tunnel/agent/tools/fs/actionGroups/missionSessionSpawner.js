//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("node:crypto");
const Launch = require("../mission/agentSessionLaunch.js");

/**
 * @file Manifests one reserved autonomous session through the existing Shared Shliach browser lane.
 * @description
 * Session capacity is reserved before Chrome work begins, preventing maintenance ticks from
 * multiplying slow launches while durable mission identity remains independent from the chat.
 */
async function spawn(buildActions, config, ws, priorSession, payload = {}, index = 0) {
	const sessionId = `session_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
	const websiteMissionId = `dispatcher-${sessionId}`;
	const missionId = priorSession?.activeMissionId || payload.missionId || "";
	const projectRoot = payload.projectRoot || payload.root || config.root;
	const replacementOf = priorSession?.id || payload.replacementOf || "";
	const role = payload.role || `autonomous-worker-${index + 1}`;
	await Launch.reserve(config, {
		agentSessionId: sessionId,
		missionId,
		projectRoot,
		replacementOf,
		role,
		websiteMissionId
	});
	try {
		const actions = buildActions(config, request({
			missionId,
			projectRoot,
			replacementOf,
			role,
			sessionId,
			websiteMissionId
		}), ws);
		const result = await actions.aiAgentSpawnWebsiteMission();
		if (result?.ok !== true) throw new Error(result?.error || "website_session_spawn_failed");
		return { ok: true, sessionId, websiteMissionId, priorSessionId: replacementOf, result };
	} catch (error) {
		await Launch.failed(config, sessionId, error);
		return { ok: false, sessionId, websiteMissionId, priorSessionId: replacementOf, error: error.message };
	}
}

function request(input) {
	return {
		action: "aiAgentSpawnWebsiteMission",
		allowRecursiveSubagents: false,
		continuationOnly: true,
		dispatcherAutonomous: true,
		agentSessionId: input.sessionId,
		replacementOf: input.replacementOf,
		goal: bootstrapPrompt(input),
		missionId: input.missionId,
		projectRoot: input.projectRoot,
		role: input.role,
		websiteMissionId: input.websiteMissionId
	};
}

/** Builds the tiny permanent handoff; all deeper operating doctrine comes from Tunnel IDs. */
function bootstrapPrompt(input = {}) {
	const replacement = input.replacementOf
		? ` replacementOf="${input.replacementOf}"`
		: "";
	return [
		"B\"H",
		"Connect to the Awtsmoos Tunnel immediately.",
		`Call missionAgentConnect with agentSessionId="${input.sessionId}"${replacement} missionId="${input.missionId || ""}" projectRoot="${input.projectRoot}".`,
		"Use the Tunnel briefing as durable truth. Fetch deeper instruction bodies by ID only when needed.",
		"Work continuously: report evidence/discoveries, then call missionAgentNextWork whenever the current work closes."
	].join("\n");
}

module.exports = { bootstrapPrompt, request, spawn };
