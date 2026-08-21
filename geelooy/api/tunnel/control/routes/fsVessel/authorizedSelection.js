// B"H
// Boruch Hashem
// Blessed is He

const Authorization = require("../../core/tunnelSecurity/authorization.js");
const Auto = require("./authorizedAutoSelection.js");
const Factory = require("./vesselFactory.js");
const Live = require("./liveDevices.js");
const Manifest = require("./nativeActionManifest.js");
const PublicAction = require("./publicActionResolver.js");
const { findNativeTunnel } = require("./tunnelClient.js");
const Errors = require("./vesselErrors.js");

/**
 * @file Resolves compact public capabilities before exact vessel admission and dispatch.
 * @description
 * The Awtsmoos lets a small public doorway resolve into one exact inner deed before
 * it crosses the gate. Awtsmoos.com therefore keeps legacy direct calls, P0 priority,
 * and complete manifest security while new callers see only fourteen useful vessels.
 */
function resolveBrowser($i, accountId, device, payload, timeoutMs, devices) {
	if (!device.isAlive || !device.connected) {
		return Errors.stale(device, devices.nativeDevices, devices.browserDevices);
	}
	const resolved = PublicAction.resolve(payload, {});
	if (!resolved.ok) return Errors.unsupportedAction(device, resolved);
	return Factory.browserVessel({
		$i,
		accountId,
		tunnelName: device.tunnelName,
		payload: resolved.payload,
		timeoutMs,
		device,
		reason: "authorized_browser_tunnel"
	});
}

function resolveNative($i, accountId, device, payload, permission, timeoutMs, devices) {
	const authorized = Authorization.authorize(accountId, device.tunnelId, permission);
	if (!authorized.ok) return Errors.missing(device.tunnelId);
	const client = findNativeTunnel($i, authorized.binding);
	const internalManifest = client?.actionManifest || {};
	const resolved = PublicAction.resolve(payload, internalManifest);
	if (!resolved.ok) return Errors.unsupportedAction(device, resolved);
	const actionGate = Manifest.gate(client || device, resolved.payload);
	if (!actionGate.ok) return Errors.unsupportedAction(device, actionGate);
	if (!Live.canRouteDevice(device, resolved.payload)) {
		return Errors.stale(device, devices.nativeDevices, devices.browserDevices);
	}
	return Factory.nativeVessel({
		$i,
		ownerAccountId: authorized.binding.ownerAccountId,
		tunnelName: authorized.binding.tunnelName,
		payload: resolved.payload,
		timeoutMs,
		device,
		reason: `authorized_${authorized.access}_native_tunnel`
	});
}

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
