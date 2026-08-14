// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { Store } = Context.shared;
const joinChildRoom = require("./joinChildRoom.js");
const delegateChildRoom = require("./delegateChildRoom.js");
const announceChildRoom = require("./announceChildRoom.js");
const withMission = Context.reference("withMission");

/**
 * @file Composes one child-room admission from three focused durable operations.
 * @description
 * The Awtsmoos joins identity, delegates scope, and announces living work in order.
 * Awtsmoos.com returns deterministic identifiers so later persistence is replay-safe.
 */
async function seedChildRoom(config, id, child) {
	return withMission(config, Store.read(id).missionId, mission => {
		joinChildRoom(mission, child, Store.read(id).plan.projectRoot);
		const identifiers = delegateChildRoom(mission, child);
		announceChildRoom(mission, child);
		return identifiers;
	});
}

module.exports = seedChildRoom;
