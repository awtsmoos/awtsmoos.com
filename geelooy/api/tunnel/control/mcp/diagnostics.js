//B"H
//Boruch Hashem
//Blessed is He

const DeviceTools = require('./deviceTools.js');

/** Report independent reachability, authority and execution evidence. */
function diagnoseDevice(device = {}, identity = {}) {
	const cap = device.capabilities || {};
	const scopes = Array.isArray(identity.scopes) ? identity.scopes : [];
	const permissions = Array.isArray(device.permissions) ? device.permissions : [];
	const connected = device.connected === true;
	const native = device.vesselType === 'native';
	const capable = native && cap.commandRun === true;
	const principalAllowed = scopes.includes('tunnel.command');
	const grantAllowed = device.access === 'owned' || permissions.includes('tunnel.command');
	const attempted = connected && capable && principalAllowed && grantAllowed;
	const freshExecution = device.executionHealthy === true && device.executionHealthFresh === true;
	const freshAcceptance = device.acceptanceHealthy === true && device.acceptanceHealthFresh === true;
	const warnings = [];
	if (!connected) warnings.push('TUNNEL_OFFLINE');
	if (device.livenessState === 'stale') warnings.push('ROUTE_STALE');
	if (!capable) warnings.push('COMMAND_CAPABILITY_NOT_ADVERTISED');
	if (!principalAllowed) warnings.push('PRINCIPAL_COMMAND_SCOPE_MISSING');
	if (!grantAllowed) warnings.push('DEVICE_COMMAND_GRANT_MISSING');
	if (!freshExecution || !freshAcceptance) warnings.push('FRESH_COMMAND_SUCCESS_NOT_PROVED');
	return {
		connected,
		livenessState: device.livenessState || (connected ? 'connected' : 'disconnected'),
		capabilities: { commandRun: capable, fsRead: cap.fsRead === true, fsWrite: cap.fsWrite === true, browserControl: cap.browserControl === true },
		permissions: { principalCommandScope: principalAllowed, deviceCommandGrant: grantAllowed },
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
		...diagnoseDevice(device, identity),
		message: 'Diagnostic evidence only. A harmless authorized command and its terminal exit code remain the execution proof.'
	};
}

module.exports = { diagnoseDevice, tunnelDoctor };
