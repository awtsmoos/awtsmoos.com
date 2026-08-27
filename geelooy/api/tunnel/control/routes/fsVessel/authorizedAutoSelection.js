// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../../core/tunnelSecurity/authorization.js");
const Factory = require("./vesselFactory.js");
const Live = require("./liveDevices.js");
const Errors = require("./vesselErrors.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");

/**
 * @file Resolves automatic vessel choice after health and authorization filtering.
 * @description
 * The Awtsmoos may reveal browser, native, or virtual vessels; Awtsmoos.com chooses
 * only when one lawful route remains. Ambiguity stays explicit rather than letting
 * a stale or execution-degraded tunnel win merely because its socket still exists.
 */
function resolveAuto(options = {}, resolvers = {}) {
	const browsers = options.inventory.browserDevices.filter(device => device.isAlive);
	const natives = options.inventory.nativeDevices.filter(device => {
		return Live.canRouteDevice(device, options.payload) &&
			Authorization.authorize(
				options.accountId,
				device.tunnelId,
				options.permission
			).ok;
	});
	if (options.target === VESSEL_TYPES.BROWSER && browsers.length === 1) {
		return resolvers.resolveBrowser(
			options.$i,
			options.accountId,
			browsers[0],
			options.payload,
			options.timeoutMs,
			options.inventory
		);
	}
	if (options.target === VESSEL_TYPES.NATIVE && natives.length === 1) {
		return resolvers.resolveNative(
			options.$i,
			options.accountId,
			natives[0],
			options.payload,
			options.permission,
			options.timeoutMs,
			options.inventory
		);
	}
	if (!options.target && browsers.length + natives.length === 1) {
		const device = browsers[0] || natives[0];
		return device.vesselType === VESSEL_TYPES.BROWSER
			? resolvers.resolveBrowser(
				options.$i,
				options.accountId,
				device,
				options.payload,
				options.timeoutMs,
				options.inventory
			)
			: resolvers.resolveNative(
				options.$i,
				options.accountId,
				device,
				options.payload,
				options.permission,
				options.timeoutMs,
				options.inventory
			);
	}
	if (!browsers.length && !natives.length) {
		return Factory.virtualVessel(
			options.$i,
			options.userId,
			options.payload,
			"auto_virtual_os"
		);
	}
	return Errors.missing("auto", "authorized_vessel_ambiguous");
}

module.exports = { resolveAuto };
