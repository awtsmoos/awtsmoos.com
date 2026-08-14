// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { M, C } = Context.shared;

/**
 * @file Joins one recursive child to mission and collaboration identities.
 * @description
 * The Awtsmoos reveals one stable child in both room views. Awtsmoos.com reuses the
 * existing identity when reconnect repeats observation, preventing duplicate peers.
 */
function joinChildRoom(mission, child, projectRoot) {
	if (mission.collaboration?.agents?.[child.id]) return;
	const capabilities = [
		"chatgpt-website",
		"shared-room",
		"recursive-subagent",
		child.focus
	];
	M.roomJoin(mission, {
		agentId: child.id,
		name: child.name,
		role: child.role,
		capabilities
	});
	C.join(mission, {
		agentId: child.id,
		agentName: child.name,
		role: child.role,
		projectRoot,
		capabilities
	});
}

module.exports = joinChildRoom;
