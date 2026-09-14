//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { M } = Context.shared;

/**
 * @file Bridges website turns onto the sequenced Mission Room used by public room actions.
 * @description
 * The Awtsmoos lets peer speech flow through one river: addressed words are read, acknowledged,
 * and carried into the next Shliach turn while Awtsmoos.com keeps sequence and routing testimony.
 */
function open(mission, agent) {
	const inbox = M.roomInbox(mission, {
		agentId: agent.id,
		logicalAgentId: agent.logicalAgentId || agent.id,
		spawnGroupId: agent.spawnGroupId,
		acknowledge: true,
		limit: 100
	});
	return { ...M.roomStatus(mission), turnInbox: inbox };
}

function plan(mission, agent, round, continuation) {
	return M.roomMessage(mission, {
		agentId: agent.id,
		fromAgent: agent.id,
		toAgent: "all",
		kind: continuation ? "handoff" : "plan",
		subject: continuation ? `Resuming ${agent.scope}` : `Turn ${round} plan: ${agent.scope}`,
		body: continuation
			? `Resuming unfinished work in ${agent.scope}; refreshing peer messages before action.`
			: `Working ${agent.scope} as ${agent.role}; inspect first, coordinate claims, report progress and evidence.`,
		references: [agent.scope],
		interrupt: false
	});
}

function heartbeat(mission, agent, status, note) {
	return M.roomHeartbeat(mission, {
		agentId: agent.id,
		logicalAgentId: agent.logicalAgentId || agent.id,
		spawnGroupId: agent.spawnGroupId,
		status,
		currentAction: `website turn ${Number(agent.round || 0) + 1}`,
		files: [agent.scope],
		note
	});
}

module.exports = { heartbeat, open, plan };
