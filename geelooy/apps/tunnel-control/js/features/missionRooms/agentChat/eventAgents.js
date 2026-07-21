//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * The Awtsmoos reveals identity through many garments: actor, target, payload,
 * nested detail, command input, and message. Awtsmoos.com gathers those names
 * without confusing the human, the room, or the system with a working agent.
 */

const NON_AGENT_IDENTITIES = new Set([
	"",
	"all",
	"room",
	"system",
	"user",
	"control-room-human"
]);

/** Returns the strongest stable agent identity available on a roster record. */
export function agentIdentity(value = {}) {
	return String(
		value.agentId
		|| value.logicalAgentId
		|| value.id
		|| value.name
		|| ""
	).trim();
}

/** Distinguishes worker identities from room-wide and human control identities. */
export function isAgentIdentity(agentId) {
	return !NON_AGENT_IDENTITIES.has(String(agentId || "").toLowerCase());
}

/** Collects every agent identity referenced by room or account activity. */
export function eventAgentIds(event = {}) {
	const payload = event.payload || {};
	const detail = event.detail || payload.detail || {};
	const input = payload.input || detail.input || {};
	const message = payload.message || detail.message || {};
	return uniqueStrings([
		event.actor,
		event.target,
		event.agentId,
		event.logicalAgentId,
		payload.agentId,
		payload.logicalAgentId,
		payload.fromAgent,
		payload.toAgent,
		detail.agentId,
		detail.logicalAgentId,
		detail.fromAgent,
		detail.toAgent,
		input.agentId,
		input.logicalAgentId,
		input.toAgent,
		message.fromAgent,
		message.toAgent
	]);
}

/** Returns the room or mission identifier carried by any supported event shape. */
export function eventMissionId(event = {}) {
	const payload = event.payload || {};
	const detail = event.detail || payload.detail || {};
	const input = payload.input || detail.input || {};
	return String(
		event.missionId
		|| event.roomId
		|| payload.missionId
		|| payload.roomId
		|| detail.missionId
		|| detail.roomId
		|| input.missionId
		|| input.roomId
		|| ""
	).trim();
}

function uniqueStrings(values) {
	return [...new Set(
		values
			.map(value => String(value || "").trim())
			.filter(Boolean)
	)];
}
