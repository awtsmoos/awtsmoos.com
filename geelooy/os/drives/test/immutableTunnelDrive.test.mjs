// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves remote OS drives bind to immutable live routes and VFS capability.
 * @description
 * The Awtsmoos lets a title remain human while the mounted root keeps the true
 * route. Awtsmoos.com refuses stale, probing, execution-degraded, or unreadable
 * shadows and gives write only where verified file capability explicitly allows it.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	isMountableDevice,
	remoteDriveIdentity
} from "../remoteDriveIdentity.js";
import { remoteDriveMount } from "../remoteDriveMount.js";
import {
	currentDevices,
	syncRemoteDrives
} from "../remoteDriveSync.js";
import { deviceDrive } from "../tunnelDriveMapper.js";

function device(overrides = {}) {
	return {
		ownershipVerified: true,
		connected: true,
		isAlive: true,
		routeReference: "route-live",
		tunnelId: "tun-fallback",
		tunnelName: "Friendly Mac",
		deviceName: "Mac",
		vesselType: "native-tunnel",
		capabilities: { fsRead: true, fsWrite: true, commandRun: true },
		executionHealthSupported: true,
		executionHealthy: true,
		executionHealthFresh: true,
		...overrides
	};
}

test("drive identity uses immutable route while title stays friendly", () => {
	const identity = remoteDriveIdentity(device());
	assert.equal(identity.routeReference, "route-live");
	assert.equal(identity.root, "/network/route-live");
	assert.equal(identity.providerId, "route-live");
	assert.equal(identity.title, "Mac");
	assert.notEqual(identity.root, "/network/Friendly Mac");
});

test("mountability rejects stale probing degraded and unreadable devices", () => {
	assert.equal(isMountableDevice(device()), true);
	assert.equal(isMountableDevice(device({ connected: false })), false);
	assert.equal(isMountableDevice(device({ probing: true })), false);
	assert.equal(isMountableDevice(device({ executionHealthy: false })), false);
	assert.equal(isMountableDevice(device({ capabilities: { fsRead: false } })), false);
});

test("browser drive keeps route as address and browser-tab as resolver hint", () => {
	const drive = deviceDrive(device({
		vesselType: "browser-tunnel",
		routeReference: "browser-route",
		tunnelName: "awt-code"
	}));
	assert.equal(drive.root, "/network/browser-route");
	assert.equal(drive.providerId, "browser-route");
	assert.equal(drive.targetVessel, "browser-tab");
});

test("dynamic mount permissions follow verified file write capability", () => {
	const writable = remoteDriveMount(deviceDrive(device()));
	const readOnly = remoteDriveMount(deviceDrive(device({
		capabilities: { fsRead: true, fsWrite: false }
	})));
	assert.equal(writable.permissions.write, true);
	assert.equal(readOnly.permissions.write, false);
	assert.equal(writable.permissions.delete, false);
});

test("current device extraction supports modern and legacy inventory shapes", () => {
	assert.equal(currentDevices({ nativeDevices: [device()] }).length, 1);
	assert.equal(currentDevices({
		devices: [device(), { kind: "virtual-os", syntheticTunnel: true }]
	}).length, 1);
});

test("sync removes stale dynamic drives and mounts without touching static roots", () => {
	const mounted = [
		{ id: "home", root: "/home" },
		{ id: "network-old", root: "/network/old", dynamicTunnelDrive: true, routeReference: "old" }
	];
	const vfsMounts = [
		{ id: "mount:home", prefix: "/home" },
		{ id: "mount:tunnel:old", prefix: "/network/old", adapterId: "tunnel", dynamicTunnelMount: true }
	];
	const registry = fakeRegistry(mounted, vfsMounts);
	const drives = syncRemoteDrives(registry, { nativeDevices: [device()] });
	assert.equal(drives[0].root, "/network/route-live");
	assert.ok(registry.list().some(item => item.id === "home"));
	assert.equal(registry.list().some(item => item.id === "network-old"), false);
	assert.equal(vfsMounts.some(item => item.id === "mount:tunnel:old"), false);
	assert.ok(vfsMounts.some(item => item.id === "mount:tunnel:route-live"));
});

function fakeRegistry(drives, mounts) {
	const registry = {
		drives,
		list() { return this.drives; },
		mount(value) { this.drives = [...this.drives.filter(item => item.id !== value.id), value]; return value; },
		unmount(id) { this.drives = this.drives.filter(item => item.id !== id); },
		os: { vfs: {
			mounts: () => mounts,
			mount(value) { mounts.push(value); },
			unmount(id) { const index = mounts.findIndex(item => item.id === id); if (index >= 0) mounts.splice(index, 1); }
		} }
	};
	return registry;
}
