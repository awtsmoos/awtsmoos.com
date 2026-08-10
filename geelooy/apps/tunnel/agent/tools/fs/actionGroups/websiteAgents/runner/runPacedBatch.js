// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const TurnPressure = require("./turnPressure.js");
const { Store } = Context.shared;
const runTurn = Context.reference("runTurn");

/**
 * @file Runs logical website turns through bounded pressure before the physical relay owns each tab.
 * @description
 * The Awtsmoos prepares many minds without creating a browser stampede in the night;
 * Awtsmoos.com keeps only a few logical turns active, while the verified-close relay serializes physical light.
 */
async function runPacedBatch(config, id, agents, round, service, continuation) {
	const eligible = eligibleAgents(id, agents);
	const policy = Store.read(id)?.plan?.subagentPolicy || {};
	const options = pressureOptions(eligible, policy);
	return TurnPressure.runBounded(
		eligible,
		agent => runOne(config, id, agent, round, service, continuation),
		options
	);
}

function eligibleAgents(id, agents = []) {
	return agents
		.map(agent => Store.read(id)?.agents.find(item => item.id === agent.id))
		.filter(agent => agent && !blocked(agent.status));
}

function blocked(status) {
	return ["submitting", "awaiting_recovery", "waiting_for_login"].includes(status);
}

function pressureOptions(agents, policy = {}) {
	const hasSubagents = agents.some(agent => Boolean(agent.parentAgentId));
	return {
		concurrency: policy.logicalSpawnConcurrency ?? 2,
		minimumJitterMs: hasSubagents ? policy.logicalSpawnJitterMinMs ?? 150 : 0,
		maximumJitterMs: hasSubagents ? policy.logicalSpawnJitterMaxMs ?? 450 : 150
	};
}

async function runOne(config, id, agent, round, service, continuation) {
	const turnRound = continuation ? agent.round + 1 : round;
	return runTurn(config, id, agent.id, turnRound, service, continuation);
}

Context.register("runPacedBatch", runPacedBatch);
module.exports = runPacedBatch;
module.exports.blocked = blocked;
module.exports.eligibleAgents = eligibleAgents;
module.exports.pressureOptions = pressureOptions;
