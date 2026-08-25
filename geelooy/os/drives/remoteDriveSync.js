//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Synchronizes verified live tunnel devices into DriveRegistry and VFS without no-op churn.
 * @description
 * The Awtsmoos renews which vessels are alive every instant. Awtsmoos.com mounts
 * only present readable routes, releases stale shadows, and now leaves unchanged
 * VFS vessels untouched so quiet truth does not tear itself down merely to rhyme.
 */
import { deviceDrive } from "./tunnelDriveMapper.js";
import { isMountableDevice } from "./remoteDriveIdentity.js";
import { reconcileRemoteMounts } from "./remoteMountReconciler.js";

/**
 * Applies one current device inventory to DriveRegistry and its VFS mount set.
 *
 * @param {object} registry DriveRegistry receiving dynamic tunnel drives.
 * @param {object} payload Current tunnel-control inventory.
 * @returns {ReadonlyArray<object>} Current mounted dynamic tunnel drive records.
 */
export function syncRemoteDrives(registry, payload = {}) {
	const devices = currentDevices(payload).filter(isMountableDevice);
	const drives = devices.map(device => registry.mount(deviceDrive(device)));
	const liveIds = new Set(drives.map(drive => drive.id));
	removeStaleDrives(registry, liveIds);
	reconcileRemoteMounts(registry.os?.vfs, drives);
	return Object.freeze(drives);
}

/**
 * Extracts physical/browser tunnel devices while excluding synthetic virtual OS entries.
 *
 * @param {object} payload Tunnel-control inventory shape.
 * @returns {Array<object>} Candidate remote devices.
 */
export function currentDevices(payload = {}) {
	if (Array.isArray(payload.nativeDevices) || Array.isArray(payload.browserDevices)) {
		return [
			...(payload.nativeDevices || []),
			...(payload.browserDevices || [])
		];
	}
	return (payload.devices || []).filter(device => {
		const type = device.vesselType || device.kind || "";
		return type !== "virtual-os" && device.syntheticTunnel !== true;
	});
}

function removeStaleDrives(registry, liveIds) {
	for (const drive of registry.list()) {
		if (drive.dynamicTunnelDrive === true && !liveIds.has(drive.id)) {
			registry.unmount(drive.id);
		}
	}
}
