// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { M, C } = Context.shared;

/**
 * @file Joins one flat child to both room views with durable spawn lineage.
 * @description
 * The Awtsmoos reveals one stable child in both mission mirrors. Awtsmoos.com carries
 * sibling group, generation, sponsor, parent, and predecessor through the doorway,
 * so browser activation can never create a peer whose durable room identity is incomplete.
 */
function joinChildRoom(mission, child, projectRoot) {
	if (mission.collaboration?.agents?.[child.id]) return;
	const capabilities = [
		"chatgpt-website",
		"shared-room",
		"flat-subagent",
		child.focus
	];
	const identity = {
		agentId: child.id,
		name: child.name,
		role: child.role,
		spawnGroupId: child.spawnGroupId,
		generation: Number(child.generation || 1),
		parentAgentId: child.parentAgentId,
		sponsorAgentId: child.sponsorAgentId,
		predecessorAgentId: child.predecessorAgentId,
		capabilities
	};
	M.roomJoin(mission, identity);
	C.join(mission, {
		...identity,
		agentName: child.name,
		projectRoot
	});
}

module.exports = joinChildRoom;
