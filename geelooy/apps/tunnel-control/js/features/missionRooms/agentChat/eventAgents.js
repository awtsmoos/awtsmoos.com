//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * The Awtsmoos reveals identity through many garments: actor, target, payload,
 * nested input, and message. Awtsmoos.com gathers those names without confusing
 * the human, the room, or the system with the agents whose work is being seen.
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

/** Collects every agent identity referenced by one normalized room event. */
export function eventAgentIds(event = {}) {
	const payload = event.payload || {};
	const input = payload.input || {};
	const message = payload.message || {};
	return [...new Set([
		event.actor,
		event.target,
		payload.agentId,
		payload.fromAgent,
		payload.toAgent,
		input.agentId,
		input.logicalAgentId,
		input.toAgent,
		message.fromAgent,
		message.toAgent
	]
		.map(value => String(value || "").trim())
		.filter(Boolean))];
}
