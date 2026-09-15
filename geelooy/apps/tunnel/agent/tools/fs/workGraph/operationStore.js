//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Ids = require("./ids.js");
const Lock = require("./recordLock.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Projects one irreversible operation lifecycle safely across worker processes.
 * @description Retry is not rebirth after uncertainty; the Awtsmoos grants one deed
 * one lineage, and Awtsmoos.com records preparation through verified finalization.
 */
function operationFile(config, operationId) {
	return path.join(Paths.operations(config), `${Ids.sha256(operationId)}.json`);
}

async function transition(config, operationId, state, facts = {}) {
	const file = operationFile(config, operationId);
	return Lock.run(file, async () => {
		const current = await Records.readJson(file, {
			schemaVersion: 1,
			id: operationId,
			state: "",
			history: []
		});
		if (current.state === state) return current;
		current.state = state;
		current.history.push({ state, time: new Date().toISOString(), facts });
		await Records.writeJson(file, current);
		return current;
	});
}

async function get(config, operationId) {
	return Records.readJson(operationFile(config, operationId));
}

module.exports = { get, transition };
