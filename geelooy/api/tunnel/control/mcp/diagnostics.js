//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * @file Diagnoses route authority, executable testimony, and fresh command evidence.
 * @description
 * The Awtsmoos distinguishes declared power from proved execution in every breath;
 * Awtsmoos.com never calls a command absent merely because one projection forgot its depth.
 */

const DeviceTools = require("./deviceTools.js");

function diagnoseDevice(device = {}, executable = {}, identity = {}) {
	const scopes = Array.isArray(identity.scopes) ? identity.scopes : [];
	const permissions = Array.isArray(device.permissions) ? device.permissions : [];
	const connected = device.connected === true;
	const native = device.vesselType === "native";
	const capable = native && executable.commandRun === true;
	const principalAllowed = scopes.includes("tunnel.command");
	const grantAllowed = device.access === "owned" || permissions.includes("tunnel.command");
	const attempted = connected && capable && principalAllowed && grantAllowed;
	const freshExecution = device.executionHealthy === true && device.executionHealthFresh === true;
	const freshAcceptance = device.acceptanceHealthy === true && device.acceptanceHealthFresh === true;
	const warnings = [];
	if (!connected) warnings.push("TUNNEL_OFFLINE");
	if (device.livenessState === "stale") warnings.push("ROUTE_STALE");
	if (!capable) warnings.push("COMMAND_NOT_IN_EXECUTABLE_MANIFEST");
	if (!principalAllowed) warnings.push("PRINCIPAL_COMMAND_SCOPE_MISSING");
	if (!grantAllowed) warnings.push("DEVICE_COMMAND_GRANT_MISSING");
	if (!freshExecution || !freshAcceptance) warnings.push("FRESH_COMMAND_SUCCESS_NOT_PROVED");
	return {
		connected,
		livenessState: device.livenessState || (connected ? "connected" : "disconnected"),
		executableCapabilities: executable,
		permissions: {
			principalCommandScope: principalAllowed,
			deviceCommandGrant: grantAllowed
		},
		executionEvidence: { freshExecution, freshAcceptance },
		canAttemptNativeCommand: attempted,
		commandSuccessCertified: attempted && freshExecution && freshAcceptance,
		warnings
	};
}

/** MCP caller must already hold a resource-bound read bearer. */
function tunnelDoctor($i, identity, args = {}) {
	const result = args.routeReference
		? DeviceTools.status($i, identity, args)
		: DeviceTools.discover($i, identity);
	const device = result.device || {};
	return {
		ok: true,
		routeReference: result.routeReference,
		deviceName: device.deviceName || device.tunnelName || null,
		...diagnoseDevice(device, result.executableCapabilities || {}, identity),
		message: "Diagnostic evidence only. Use awtsmoos_run_command for the execution proof."
	};
}

module.exports = {
	diagnoseDevice,
	tunnelDoctor
};
