// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Fairness = require("./spawnFairness.js");
const { Store } = Context.shared;
const seedChildRoom = require("./seedChildRoom.js");
const commitSeededChild = require("./commitSeededChild.js");

/** Seeds only a sponsor-fair slice of flat peers the runtime can materialize. */
async function seedPendingChildren(config, id, limit) {
	const record = Store.read(id);
	const pending = selectPending(record, limit);
	for (const peer of pending) {
		const identifiers = await seedChildRoom(config, id, peer);
		commitSeededChild(id, peer, identifiers);
	}
	return pending.length;
}

function selectPending(record = {}, limit) {
	const pending = (record.agents || []).filter(agent =>
		(agent.isSpawnedAgent || agent.parentAgentId) && agent.roomSeeded === false
	);
	const maximum = boundedLimit(limit);
	if (maximum === Infinity) return pending;
	if (maximum === 0) return [];
	return Fairness.roundRobin(Fairness.groupByParent(pending), maximum);
}

function boundedLimit(value) {
	if (value === undefined || value === null) return Infinity;
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : Infinity;
}

Context.register("seedPendingChildren", seedPendingChildren);
module.exports = seedPendingChildren;
module.exports.boundedLimit = boundedLimit;
module.exports.selectPending = selectPending;
