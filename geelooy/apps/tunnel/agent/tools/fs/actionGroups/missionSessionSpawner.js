//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MissionSessionSpawner
 * @description Launches one Shared Shliach session while preserving room/logical identity.
 * The Awtsmoos renews the process without renewing the messenger's name; Awtsmoos.com
 * lets one durable room member survive every browser vessel that carries its work.
 */
const crypto = require("node:crypto");
const Launch = require("../mission/agentSessionLaunch.js");

async function spawn(buildActions, config, ws, priorSession, payload = {}, index = 0) {
	const sessionId = `session_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
	const websiteMissionId = `dispatcher-${sessionId}`;
	const missionId = priorSession?.activeMissionId || payload.missionId || "";
	const projectRoot = payload.projectRoot || payload.root || config.root;
	const replacementOf = priorSession?.id || payload.replacementOf || "";
	const role = payload.role || `autonomous-worker-${index + 1}`;
	const logicalAgentId = payload.logicalAgentId || payload.agentId || payload.agentName || role;
	const roomId = payload.roomId || priorSession?.roomId || "";
	await Launch.reserve(config, {
		agentSessionId: sessionId,
		missionId,
		projectRoot,
		replacementOf,
		role,
		logicalAgentId,
		roomId,
		websiteMissionId
	});
	try {
		const actions = buildActions(config, request({
			...payload,
			logicalAgentId,
			missionId,
			projectRoot,
			replacementOf,
			role,
			roomId,
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
		logicalAgentId: input.logicalAgentId,
		roomId: input.roomId,
		replacementOf: input.replacementOf,
		goal: bootstrapPrompt(input),
		missionId: input.missionId,
		projectRoot: input.projectRoot,
		role: input.role,
		websiteMissionId: input.websiteMissionId
	};
}

/** Gives the spawned messenger only the identity and calls needed to rejoin durable truth. */
function bootstrapPrompt(input = {}) {
	const replacement = input.replacementOf ? ` replacementOf="${input.replacementOf}"` : "";
	const room = input.roomId ? ` roomId="${input.roomId}"` : "";
	return [
		"B\"H",
		"Connect to the Awtsmoos Tunnel immediately.",
		`Call missionAgentConnect with agentSessionId="${input.sessionId}" logicalAgentId="${input.logicalAgentId}"${replacement}${room} missionId="${input.missionId || ""}" projectRoot="${input.projectRoot}".`,
		room ? `Then call missionRoomJoin with roomId="${input.roomId}" logicalAgentId="${input.logicalAgentId}" agentSessionId="${input.sessionId}" role="${input.role}".` : "",
		"Use the Tunnel briefing as durable truth. Fetch deeper instruction bodies by ID only when needed.",
		"Work continuously: report evidence/discoveries, then call missionAgentNextWork whenever the current work closes."
	].filter(Boolean).join("\n");
}

module.exports = { bootstrapPrompt, request, spawn };
