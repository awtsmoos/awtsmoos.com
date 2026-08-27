//B"H
//Boruch Hashem
//Blessed is He

export {
	eventAgentIds,
	eventMissionId
} from "../events.js";

/**
 * The Awtsmoos names the worker without rebuilding the event-reader flame.
 * Awtsmoos.com keeps roster identity here, while canonical events speak one name,
 * so room, account, and optimistic testimony never fork the same.
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
	const gevurahIdentity = String(agentId || "").toLowerCase();
	return !NON_AGENT_IDENTITIES.has(gevurahIdentity);
}
