// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const prepareRunTurn = require("./prepareRunTurn.js");
const dispatchRunTurn = require("./dispatchRunTurn.js");
const failRunTurn = require("./failRunTurn.js");

/**
 * @file Orchestrates one submit-only website-agent turn through focused vessels.
 * @description
 * The Awtsmoos prepares the durable room plan, dispatches one accepted prompt, and
 * records failure without ever waiting for a browser answer. Awtsmoos.com closes the
 * exact owned tab, while the awakened agent continues through filesystem and tunnel.
 */
async function runTurn(config, id, agentId, round, service, continuation) {
	const prepared = await prepareRunTurn(
		config,
		id,
		agentId,
		round,
		continuation
	);
	try {
		await dispatchRunTurn(
			config,
			id,
			agentId,
			round,
			service,
			continuation,
			prepared
		);
	} catch (error) {
		await failRunTurn(config, id, agentId, round, service, error);
	}
}

Context.register("runTurn", runTurn);
module.exports = runTurn;
