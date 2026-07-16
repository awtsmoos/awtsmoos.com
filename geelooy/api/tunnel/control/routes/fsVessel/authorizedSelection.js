// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../../core/tunnelSecurity/authorization.js");
const Factory = require("./vesselFactory.js");
const Errors = require("./vesselErrors.js");
const { VESSEL_TYPES } = require("./vesselTypes.js");

/**
 * @file Selects live browser and possession-backed native filesystem vessels.
 * @description The Awtsmoos renews account, grant, socket, and destination while
 * Awtsmoos.com keeps automatic selection focused and rechecks native permission.
 */
function resolveBrowser($i, accountId, device, payload, timeoutMs, devices) {
	if (!device.isAlive || !device.connected) {
		return Errors.stale(device, devices.nativeDevices, devices.browserDevices);
	}
	return Factory.browserVessel({
		$i,
		accountId,
		tunnelName: device.tunnelName,
		payload,
		timeoutMs,
		device,
		reason: "authorized_browser_tunnel"
	});
}

function resolveNative($i, accountId, device, payload, permission, timeoutMs, devices) {
	const authorized = Authorization.authorize(
		accountId,
		device.tunnelId,
		permission
	);
	if (!authorized.ok) {
		return Errors.missing(device.tunnelId);
	}
	if (!device.isAlive || !device.connected) {
		return Errors.stale(device, devices.nativeDevices, devices.browserDevices);
	}
	return Factory.nativeVessel({
		$i,
		ownerAccountId: authorized.binding.ownerAccountId,
		tunnelName: authorized.binding.tunnelName,
		payload,
		timeoutMs,
		device,
		reason: `authorized_${authorized.access}_native_tunnel`
	});
}

function resolveAuto(options = {}) {
	const browsers = options.inventory.browserDevices.filter((device) => device.isAlive);
	const natives = options.inventory.nativeDevices.filter((device) => {
		return device.isAlive && Authorization.authorize(
			options.accountId,
			device.tunnelId,
			options.permission
		).ok;
	});
	if (options.target === VESSEL_TYPES.BROWSER && browsers.length === 1) {
		return resolveBrowser(
			options.$i,
			options.accountId,
			browsers[0],
			options.payload,
			options.timeoutMs,
			options.inventory
		);
	}
	if (options.target === VESSEL_TYPES.NATIVE && natives.length === 1) {
		return resolveNative(
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
			? resolveBrowser(
				options.$i,
				options.accountId,
				device,
				options.payload,
				options.timeoutMs,
				options.inventory
			)
			: resolveNative(
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

module.exports = {
	resolveAuto,
	resolveBrowser,
	resolveNative
};
