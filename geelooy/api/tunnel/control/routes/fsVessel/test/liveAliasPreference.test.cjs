// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const {
	resolveInventoryDevice
} = require("../accountInventory.js");

/**
 * @file Proves stale reinstall aliases yield to one live account-scoped route.
 * @description
 * The Awtsmoos renews one living vessel among discarded names without guessing.
 * Awtsmoos.com keeps exact IDs supreme, selects one live same-name device, and
 * preserves ambiguity whenever more than one live route could truthfully answer.
 */
const staleOne = device("tun_stale_one", false);
const staleTwo = device("tun_stale_two", false);
const live = device("tun_live", true);

assert.equal(
	resolveInventoryDevice([staleOne, staleTwo, live], "same-name"),
	live
);
assert.equal(
	resolveInventoryDevice([staleOne, staleTwo, live], "tun_stale_two"),
	staleTwo
);
assert.equal(
	resolveInventoryDevice([staleOne, staleTwo], "same-name"),
	null
);
assert.equal(
	resolveInventoryDevice([live, device("tun_live_two", true)], "same-name"),
	null
);
assert.equal(
	resolveInventoryDevice([live], "missing-name"),
	null
);

console.log(JSON.stringify({
	ok: true,
	suite: "live-alias-preference",
	exactIdPreserved: true,
	uniqueLiveAliasSelected: true,
	multipleLiveAliasesRejected: true,
	staleOnlyAliasesRejected: true
}, null, 2));

function device(tunnelId, liveState) {
	return {
		tunnelId,
		tunnelName: "same-name",
		routeReference: tunnelId,
		connected: liveState,
		isAlive: liveState,
		kind: liveState ? "native-tunnel" : "native"
	};
}
