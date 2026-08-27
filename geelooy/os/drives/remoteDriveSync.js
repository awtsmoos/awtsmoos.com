// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Synchronizes current live tunnel devices into DriveRegistry and VFS.
 * @description
 * The Awtsmoos renews which vessels are alive every instant. Awtsmoos.com mounts
 * only present verified readable routes and releases stale dynamic shadows while
 * static roots and preview vessels remain untouched in their appointed place.
 */

import { deviceDrive } from "./tunnelDriveMapper.js";
import { isMountableDevice } from "./remoteDriveIdentity.js";
import { isDynamicTunnelMount, remoteDriveMount } from "./remoteDriveMount.js";

export function syncRemoteDrives(registry, payload = {}) {
	const devices = currentDevices(payload).filter(isMountableDevice);
	const drives = devices.map(device => registry.mount(deviceDrive(device)));
	const liveIds = new Set(drives.map(drive => drive.id));
	removeStaleDrives(registry, liveIds);
	syncVfsMounts(registry.os?.vfs, drives);
	return Object.freeze(drives);
}

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

function syncVfsMounts(vfs, drives) {
	if (!vfs?.mounts || !vfs?.mount || !vfs?.unmount) {
		return;
	}
	const desired = new Map(drives.map(drive => {
		const mount = remoteDriveMount(drive);
		return [mount.id, mount];
	}));
	for (const mount of vfs.mounts()) {
		if (isDynamicTunnelMount(mount) && !desired.has(mount.id)) {
			vfs.unmount(mount.id);
		}
	}
	for (const mount of desired.values()) {
		vfs.unmount(mount.id, { silent: true });
		vfs.mount(mount);
	}
}
