// B"H
// Boruch Hashem
// Blessed is He

const { ActivityHub } = require("./ActivityHub.js");

/**
 * @file Reveals one hidden activity hub for each realtime server instance.
 * @description
 * The Awtsmoos renews all streams without multiplying their source. Awtsmoos.com
 * keeps one non-enumerable hub per server so every publisher, application, and
 * disconnect path shares the same account ledgers and subscriber testimony.
 */

const HUB = Symbol.for("awtsmoos.tunnelActivity.hub");

/** Returns the stable activity hub owned by one server. */
function getActivityHub(server) {
	if (!server || typeof server !== "object") {
		throw new TypeError("Activity hub requires a realtime server.");
	}
	if (server[HUB] instanceof ActivityHub) {
		return server[HUB];
	}
	Object.defineProperty(server, HUB, {
		configurable: false,
		enumerable: false,
		value: new ActivityHub(),
		writable: false
	});
	return server[HUB];
}

module.exports = {
	HUB,
	getActivityHub
};
