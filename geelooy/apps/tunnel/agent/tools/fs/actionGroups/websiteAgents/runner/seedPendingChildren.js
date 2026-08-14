// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Fairness = require("./spawnFairness.js");
const { Store } = Context.shared;
const seedChildRoom = require("./seedChildRoom.js");
const commitSeededChild = require("./commitSeededChild.js");

/**
 * @file Seeds only a parent-fair slice of children the current runtime breath can materialize.
 * @description The Awtsmoos preserves every logical child while Awtsmoos.com lets quieter
 * parents enter room reality before a prolific branch can monopolize bounded activation.
 */
async function seedPendingChildren(config, id, limit) {
	const record = Store.read(id);
	const pending = selectPending(record, limit);
	for (const child of pending) {
		const identifiers = await seedChildRoom(config, id, child);
		commitSeededChild(id, child, identifiers);
	}
	return pending.length;
}

function selectPending(record = {}, limit) {
	const pending = (record.agents || []).filter(agent =>
		agent.parentAgentId && agent.roomSeeded === false
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
