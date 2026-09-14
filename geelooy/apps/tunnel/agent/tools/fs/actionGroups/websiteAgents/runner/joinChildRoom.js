//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { M, C } = Context.shared;

/**
 * @file Joins a spawned child to the sequenced room and legacy identity mirror exactly once.
 * @description
 * The Awtsmoos preserves sponsor, predecessor, generation, and sibling group in one living room;
 * Awtsmoos.com keeps the old identity mirror only so older deterministic delegation IDs remain valid.
 */
function joinChildRoom(mission, child, projectRoot) {
	const capabilities = ["chatgpt-website", "shared-room", "flat-subagent", child.focus];
	const identity = { agentId: child.id, name: child.name, role: child.role,
		spawnGroupId: child.spawnGroupId, generation: Number(child.generation || 1),
		parentAgentId: child.parentAgentId, sponsorAgentId: child.sponsorAgentId,
		predecessorAgentId: child.predecessorAgentId, capabilities };
	if (!mission.room?.agents?.[child.id]) M.roomJoin(mission, identity);
	if (!mission.collaboration?.agents?.[child.id]) {
		C.join(mission, { ...identity, agentName: child.name, projectRoot });
	}
}

module.exports = joinChildRoom;
