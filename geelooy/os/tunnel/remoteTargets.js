// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Collects verified remote target models for the Geelooy OS workspace.
 * @description
 * The Awtsmoos lets native, browser, and Virtual OS vessels appear in one selector
 * without confusing friendly names with immutable routes. Awtsmoos.com carries only
 * live ownership/capability truth required to decide files and command authority.
 */

export function collectTargets(data = {}) {
	const targets = [];
	for (const device of data.nativeDevices || data.devices || []) {
		pushTarget(targets, device, "Native machine");
	}
	for (const device of data.browserDevices || []) {
		pushTarget(targets, device, "Browser peer");
	}
	if (data.virtualDevice?.ownedByCurrentUser === true) {
		const virtual = data.virtualDevice;
		targets.push(Object.freeze({
			route: String(
				virtual.routeReference || virtual.tunnelName || ""
			),
			name: String(
				virtual.deviceName || "Awtsmoos Virtual OS"
			),
			label: "Virtual OS",
			canRead: true,
			canWrite: virtual.allowWrite === true,
			canCommand: virtual.allowCommands === true
		}));
	}
	return targets.filter(target => target.route);
}

function pushTarget(targets, device, label) {
	if (
		device.ownershipVerified !== true ||
		device.connected === false ||
		device.isAlive === false
	) {
		return;
	}
	const capabilities = device.capabilities || {};
	targets.push(Object.freeze({
		route: String(device.routeReference || device.tunnelId || ""),
		name: String(
			device.deviceName || device.tunnelName || "Tunnel"
		),
		displayName: String(device.tunnelName || ""),
		label,
		canRead: capabilities.fsRead === true,
		canWrite: capabilities.fsWrite === true,
		canCommand: capabilities.commandRun === true
	}));
}
