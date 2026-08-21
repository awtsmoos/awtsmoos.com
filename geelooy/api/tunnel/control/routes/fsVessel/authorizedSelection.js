// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../../core/tunnelSecurity/authorization.js");
const Auto = require("./authorizedAutoSelection.js");
const Factory = require("./vesselFactory.js");
const Live = require("./liveDevices.js");
const Manifest = require("./nativeActionManifest.js");
const Errors = require("./vesselErrors.js");

/**
 * @file Selects authorized vessels whose transport, executor, and action manifest agree.
 * @description
 * The Awtsmoos renews authority and executable capability together. Awtsmoos.com
 * refuses to route an action that a manifest-aware native runtime did not advertise,
 * while legacy clients remain on the compatibility bridge until they negotiate v1.
 */
function resolveBrowser($i, accountId, device, payload, timeoutMs, devices) {
	if (!device.isAlive || !device.connected) {
		return Errors.stale(device, devices.nativeDevices, devices.browserDevices);
	}
	return Factory.browserVessel({ $i, accountId, tunnelName: device.tunnelName,
		payload, timeoutMs, device, reason: "authorized_browser_tunnel" });
}

function resolveNative($i, accountId, device, payload, permission, timeoutMs, devices) {
	const authorized = Authorization.authorize(accountId, device.tunnelId, permission);
	if (!authorized.ok) return Errors.missing(device.tunnelId);
	const actionGate = Manifest.gate(device, payload);
	if (!actionGate.ok) return Errors.unsupportedAction(device, actionGate);
	if (!Live.canRouteDevice(device, payload)) {
		return Errors.stale(device, devices.nativeDevices, devices.browserDevices);
	}
	return Factory.nativeVessel({ $i, ownerAccountId: authorized.binding.ownerAccountId,
		tunnelName: authorized.binding.tunnelName, payload, timeoutMs, device,
		reason: `authorized_${authorized.access}_native_tunnel` });
}

function resolveAuto(options = {}) {
	return Auto.resolveAuto(options, { resolveBrowser, resolveNative });
}

module.exports = { resolveAuto, resolveBrowser, resolveNative };
