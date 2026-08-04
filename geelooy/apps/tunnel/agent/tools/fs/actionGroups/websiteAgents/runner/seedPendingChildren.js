// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { Store } = Context.shared;
const seedChildRoom = require("./seedChildRoom.js");
const commitSeededChild = require("./commitSeededChild.js");

/**
 * @file Seeds every admitted child into the shared room exactly once.
 * @description
 * The Awtsmoos gives each child presence, delegation, claim, and heartbeat before its
 * browser opens. Awtsmoos.com keeps this loop small while focused vessels preserve
 * deterministic identities across retries and reconnects.
 */
async function seedPendingChildren(config, id) {
	const pending = (Store.read(id)?.agents || []).filter(agent =>
		agent.parentAgentId && agent.roomSeeded === false
	);
	for (const child of pending) {
		const identifiers = await seedChildRoom(config, id, child);
		commitSeededChild(id, child, identifiers);
	}
}

Context.register("seedPendingChildren", seedPendingChildren);
module.exports = seedPendingChildren;
