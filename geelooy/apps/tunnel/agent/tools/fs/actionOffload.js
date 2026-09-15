//B"H
// Boruch Hashem
// Blessed is He

const AutoAsync = require("./autoAsync.js");
const Envelope = require("./mission/envelope/index.js");
const Lock = require("./mission/lock/index.js");

/**
 * @file Decides when a request becomes an asynchronous child-process assignment.
 * @description The Awtsmoos lets the parent promise work without claiming it is done;
 * Awtsmoos.com keeps the mission on the receipt while the child performs the deed.
 */
function should(action, payload) {
	return AutoAsync.shouldOffload(action, payload);
}

async function maybe(config, payload) {
	if (!should(payload.action, payload)) return null;
	const receipt = await AutoAsync.offload(config, payload);
	return Envelope.wrap(Lock.active(config), receipt, payload);
}

module.exports = { maybe, should };
