// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const View = require("../nativeInventoryView.js");

/**
	* @file Proves current route authority is separated from bounded dead history.
	* @description The Awtsmoos reveals living routes without erasing former witnesses.
	*/
function device(id, options = {}) {
	return {
		tunnelId: id,
		routeReference: id,
		tunnelName: options.tunnelName || "awt-one",
		deviceId: options.deviceId || id,
		connected: options.live === true,
		isAlive: options.live === true,
		lastSeenAt: options.lastSeenAt || null,
		registeredAt: options.registeredAt || null
	};
}

const live = device("tun_live", {
	live: true,
	lastSeenAt: "2026-07-26T23:00:00.000Z"
});
const deadNewest = device("tun_dead_new", {
	lastSeenAt: "2026-07-26T22:00:00.000Z"
});
const deadOld = device("tun_dead_old", {
	lastSeenAt: "2026-07-20T22:00:00.000Z"
});
const mixed = View.partition([deadOld, live, deadNewest]);
assert.deepEqual(mixed.current.map(item => item.tunnelId), ["tun_live"]);
assert.deepEqual(
	mixed.historical.map(item => item.tunnelId),
	["tun_dead_new", "tun_dead_old"]
);
assert.equal(mixed.totalHistorical, 2);

const offline = View.partition([deadOld, deadNewest]);
assert.deepEqual(offline.current.map(item => item.tunnelId), ["tun_dead_new"]);
assert.deepEqual(offline.historical.map(item => item.tunnelId), ["tun_dead_old"]);

const secondLive = device("tun_live_two", {
	live: true,
	lastSeenAt: "2026-07-26T23:01:00.000Z"
});
const ambiguous = View.partition([live, secondLive, deadNewest]);
assert.equal(ambiguous.current.length, 2);
assert.equal(ambiguous.historical.length, 1);

const bounded = View.partition([
	live,
	...Array.from({ length: 30 }, (_, index) => device(`tun_dead_${index}`, {
		lastSeenAt: new Date(Date.UTC(2026, 6, 1, 0, 0, index)).toISOString()
	}))
], 5);
assert.equal(bounded.historical.length, 5);
assert.equal(bounded.totalHistorical, 30);
assert.equal(bounded.hiddenCount, 25);

console.log(JSON.stringify({
	ok: true,
	suite: "native-inventory-view",
	liveAuthorityPreferred: true,
	offlineFallbackPreserved: true,
	multipleLiveRemainExplicit: true,
	historyBounded: true
}, null, 2));
