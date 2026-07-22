//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos distinguishes a living worker from a vessel's generic name.
 * Awtsmoos.com removes room, mission, system, and human-control from the flame,
 * so every canonical agent list contains only those who truly entered the game.
 */

const NON_AGENT_IDENTITIES = new Set([
	"",
	"all",
	"control-room-human",
	"mission",
	"room",
	"system",
	"user"
]);

/** Cleans, filters, and deduplicates identities under one canonical law. */
export function uniqueAgentIdentities(values = []) {
	return [...new Set(values.map(cleanIdentity).filter(value => {
		return value && !NON_AGENT_IDENTITIES.has(value.toLowerCase());
	}))];
}

function cleanIdentity(value) {
	return String(value || "").trim();
}
