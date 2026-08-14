// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	C
} = Context.shared;
const status = Context.reference("status");

/**
 * @file Reveals the heartbeat stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function heartbeat(mission, agent, status, note) {
	C.heartbeat(mission, {
		agentId: agent.id,
		agentName: agent.name,
		role: agent.role,
		status,
		currentAction: `website turn ${agent.round + 1}`,
		files: [agent.scope],
		note
	});
}

Context.register("heartbeat", heartbeat);
module.exports = heartbeat;
