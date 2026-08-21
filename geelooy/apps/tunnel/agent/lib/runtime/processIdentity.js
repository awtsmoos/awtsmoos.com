// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

/**
 * @file Gives every logical agent generation a durable process identity tuple.
 * @description
 * The Awtsmoos renews a messenger without confusing renewal with duplication.
 * Awtsmoos.com binds mission, room, logical agent, session, generation, spawn group,
 * parent, and predecessor so stale incarnations can be fenced instead of multiplied.
 */
function fromPayload(payload = {}, fallback = {}) {
	const missionId = clean(payload.missionId || fallback.missionId || "no_mission");
	const roomId = clean(payload.roomId || payload.missionRoomId || fallback.roomId || missionId);
	const logicalAgentId = clean(payload.logicalAgentId || payload.agentId ||
		payload.agentName || fallback.logicalAgentId || "agent");
	const generation = positiveInteger(payload.generation ?? fallback.generation, 1);
	const spawnGroupId = clean(payload.spawnGroupId || fallback.spawnGroupId ||
		`spawn_${shortHash(`${missionId}:${roomId}:${logicalAgentId}`)}`);
	const agentSessionId = clean(payload.agentSessionId || fallback.agentSessionId ||
		`session_${shortHash(`${missionId}:${roomId}:${logicalAgentId}:${generation}:${spawnGroupId}`)}`);
	const parentAgentId = clean(payload.parentAgentId || fallback.parentAgentId);
	const predecessorAgentId = clean(payload.predecessorAgentId || fallback.predecessorAgentId);
	const processKey = clean(`${missionId}__${roomId}__${logicalAgentId}__g${generation}__${agentSessionId}`);
	return { missionId, roomId, logicalAgentId, agentSessionId, generation, spawnGroupId,
		parentAgentId, predecessorAgentId, processKey, processGroup: `room:${roomId}`,
		processLabel: `${roomId}/${logicalAgentId}/g${generation}` };
}

/**
 * Converts process identity into inherited environment variables.
 * @param {object} identity Full logical-agent identity.
 * @returns {object} Environment fields for subprocess continuity.
 */
function env(identity = {}) {
	return {
		AWTSMOOS_MISSION_ID: identity.missionId || "",
		AWTSMOOS_ROOM_ID: identity.roomId || "",
		AWTSMOOS_LOGICAL_AGENT_ID: identity.logicalAgentId || "",
		AWTSMOOS_AGENT_SESSION_ID: identity.agentSessionId || "",
		AWTSMOOS_AGENT_GENERATION: String(identity.generation || 1),
		AWTSMOOS_SPAWN_GROUP_ID: identity.spawnGroupId || "",
		AWTSMOOS_PARENT_AGENT_ID: identity.parentAgentId || "",
		AWTSMOOS_PREDECESSOR_AGENT_ID: identity.predecessorAgentId || "",
		AWTSMOOS_PROCESS_KEY: identity.processKey || "",
		AWTSMOOS_PROCESS_GROUP: identity.processGroup || ""
	};
}

function osLinks(identity = {}, input = {}) {
	const compact = input.compact === false ? "false" : "true";
	const base = input.base || "https://awtsmoos.com";
	const query = new URLSearchParams({ compact, missionId: identity.missionId || "",
		roomId: identity.roomId || "", agentId: identity.logicalAgentId || "" });
	return { os: `${base}/os?${query}`, code: `${base}/apps/code?${query}`,
		tunnelControl: `${base}/apps/tunnel-control?${query}`,
		room: `${base}/os?view=mission-room&${query}`,
		agent: `${base}/os?view=agent-process&${query}` };
}

function clean(value, fallback = "") {
	const text = String(value || fallback || "").trim().replace(/[^a-zA-Z0-9_.:-]/g, "_");
	return text || fallback || "";
}

function positiveInteger(value, fallback = 1) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 1 ? number : fallback;
}

function shortHash(value) {
	return crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, 12);
}

module.exports = { clean, env, fromPayload, osLinks, positiveInteger, shortHash };
