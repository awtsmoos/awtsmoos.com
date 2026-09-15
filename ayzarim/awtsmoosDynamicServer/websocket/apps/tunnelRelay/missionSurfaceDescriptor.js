//B"H
// Boruch Hashem
// Blessed is He

const Bounds = require("./registrationDescriptorBounds.js");

/**
 * @file Bounds untrusted browser-surface Mission coordinates without granting Mission authority.
 * @description The Awtsmoos lets Code, browser Tunnel and OS reveal one Mission identity while
 * Awtsmoos.com keeps ownership and durable Mission truth in the authenticated Tunnel authority.
 */
function missionSurfaceDescriptor(data = {}) {
	const source = data.runtime?.missionSurface && typeof data.runtime.missionSurface === "object"
		? { ...data, ...data.runtime.missionSurface }
		: data;
	const missionId = Bounds.text(source.missionId);
	const participant = source.missionParticipant === true
		&& Boolean(missionId)
		&& missionId !== "no_mission";
	return Object.freeze({
		missionParticipant: participant,
		missionSurfaceVersion: Bounds.boundedInteger(source.missionSurfaceVersion || 1, 1000),
		missionId,
		roomId: Bounds.text(source.roomId),
		logicalAgentId: Bounds.text(source.logicalAgentId || source.agentId),
		agentSessionId: Bounds.text(source.agentSessionId || source.sessionId),
		generation: positive(source.generation),
		spawnGroupId: Bounds.text(source.spawnGroupId),
		parentAgentId: Bounds.text(source.parentAgentId),
		predecessorAgentId: Bounds.text(source.predecessorAgentId),
		conversationId: Bounds.text(source.conversationId),
		surface: Bounds.text(source.surface || source.vesselType || source.targetVessel)
	});
}

function positive(value) {
	const number = Number(value || 1);
	return Number.isSafeInteger(number) && number > 0 ? Math.min(number, 1000000) : 1;
}

module.exports = { missionSurfaceDescriptor, positive };
