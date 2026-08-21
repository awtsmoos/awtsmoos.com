// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("../../../../lib/runtime/processIdentity.js");

/**
 * @file Projects the full logical-agent generation tuple into Mission Room work.
 * @description
 * The Awtsmoos gives each shliach one name through many moments. Awtsmoos.com keeps
 * the stable logical name while session and generation distinguish living incarnations,
 * letting claims and successors reject the voice of a superseded predecessor.
 */
function cleanAgent(input = {}) {
	return String(input.logicalAgentId || input.agentId || input.agent || input.name || "agent")
		.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "agent";
}

function roomId(room = {}, input = {}) {
	return input.roomId || input.missionRoomId || room.id || room.missionId || "room";
}

function forAgent(room = {}, input = {}, fallbackAgent = "") {
	const logicalAgentId = fallbackAgent || cleanAgent(input);
	const publicAgent = room.agents?.[logicalAgentId] || {};
	const runtime = room.agentRuntime?.[logicalAgentId] || {};
	return Identity.fromPayload({
		...runtime,
		...publicAgent,
		...input,
		missionId: room.missionId || input.missionId,
		roomId: roomId(room, input),
		logicalAgentId
	});
}

module.exports = { cleanAgent, forAgent, roomId };
