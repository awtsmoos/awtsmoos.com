// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../../core/tunnelSecurity/authorization.js");
const Auto = require("./authorizedAutoSelection.js");
const Factory = require("./vesselFactory.js");
const Live = require("./liveDevices.js");
const Errors = require("./vesselErrors.js");

/**
 * @file Selects authorized vessels whose transport and executor may serve work.
 * @description
 * The Awtsmoos renews account, grant, socket, and consumer together. Awtsmoos.com
 * keeps legacy rollout compatibility, yet once execution health is known a green
 * websocket cannot admit ordinary native work through a stalled parent queue.
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
	if (!authorized.ok) return Errors.missing(device.tunnelId);
	if (!Live.canRouteDevice(device, payload)) {
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

/** Delegates ambiguity handling to the focused automatic-selection vessel. */
function resolveAuto(options = {}) {
	return Auto.resolveAuto(options, {
		resolveBrowser,
		resolveNative
	});
}

module.exports = {
	resolveAuto,
	resolveBrowser,
	resolveNative
};
