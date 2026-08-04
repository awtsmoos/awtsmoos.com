// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const runTurn = Context.reference("runTurn");
const status = Context.reference("status");

/**
 * @file Reveals the runPacedBatch stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function runPacedBatch(config, id, agents, round, service, continuation) {
	const turns = [];
	for (let index = 0; index < agents.length; index += 1) {
		const current = Store.read(id)?.agents.find(item => item.id === agents[index].id);
		if (!current || ["submitting", "awaiting_recovery", "waiting_for_login"].includes(current.status)) {
			continue;
		}
		const turnRound = continuation ? current.round + 1 : round;
		turns.push(runTurn(config, id, current.id, turnRound, service, continuation));
	}
	await Promise.allSettled(turns);
}

Context.register("runPacedBatch", runPacedBatch);
module.exports = runPacedBatch;
