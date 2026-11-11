// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tunnel-specific routing helpers for the Geelooy OS RemoteFs facade.
 * @description
 * The Awtsmoos lets one immutable network route carry list, read, and write while
 * Awtsmoos.com keeps discovery, fallback, and vessel-kind hints outside the small
 * public facade. Yesod remains the address; the verified vessel hint remains only
 * a guide to the resolver, and neither garment is allowed to impersonate the other.
 */

import * as Client from "./tunnelControlClient.js";
import { currentDevices } from "../drives/remoteDriveSync.js";
import {
	isMountableDevice,
	remoteDriveIdentity
} from "../drives/remoteDriveIdentity.js";
import { remoteTunnelEntries } from "./remoteTunnelEntries.js";
import { remotePathFor } from "./remoteTunnelPaths.js";
import { pressureNodes } from "./remoteFsViews.js";

export async function listTunnelRoot(os, providerPath) {
	const got = await Client.devices().catch(error => ({
		ok: false,
		error: error.message,
		devices: []
	}));
	if (got.ok !== false) {
		return currentDevices(got)
			.filter(isMountableDevice)
			.map(device => rootEntry(device, providerPath));
	}
	return fallbackDrives(os).map(drive => driveEntry(drive, providerPath));
}

export async function listTunnelRoute(os, route, innerPath, providerPath) {
	// B"H - a directory page is a window, not the room: the agent pages its
	// listings (cursor/nextCursor, hasNextPage), so follow the pages until
	// the listing is whole — a big folder (a device root with hundreds of
	// entries) must not silently truncate at the first page.
	const entries = [];
	let cursor = 0;
	let got = null;
	for (let page = 0; page < 60; page++) {
		got = await runTunnelAction(os, route, {
			action: "list",
			path: innerPath || ".",
			maxChars: 200000,
			limit: 300,
			cursor
		});
		if (got?.ok === false) {
			if (!entries.length) return pressureNodes(route, innerPath, got, providerPath);
			break;
		}
		const batch = got.detailedItems || got.items || [];
		entries.push(...batch);
		if (!got.hasNextPage || !batch.length) break;
		const next = Number(got.nextCursor);
		cursor = Number.isFinite(next) && next > cursor ? next : cursor + batch.length;
	}
	return remoteTunnelEntries(
		route,
		entries,
		innerPath,
		providerPath
	);
}

export async function runTunnelAction(os, route, payload) {
	let drive = os?.drives?.get?.(route) || null;
	if (!drive && os?.drives?.refreshRemote) {
		await os.drives.refreshRemote().catch(() => null);
		drive = os.drives.get(route);
	}
	const virtual = ["awtsmoos-virtual-os", "awtsmoos-os"].includes(route);
	const targetVessel = drive?.targetVessel || (virtual ? "virtual-os" : "");
	return Client.fsAction(
		route,
		targetVessel ? { ...payload, targetVessel } : payload
	);
}

function rootEntry(device, providerPath) {
	const identity = remoteDriveIdentity(device);
	return {
		name: identity.title,
		type: "directory",
		path: remotePathFor(identity.routeReference, "", providerPath),
		provider: "tunnel",
		routeReference: identity.routeReference,
		drive: device,
		vesselType: device.vesselType || device.kind
	};
}

function fallbackDrives(os) {
	return (os?.drives?.list?.() || []).filter(drive => {
		return drive.dynamicTunnelDrive === true;
	});
}

function driveEntry(drive, providerPath) {
	return {
		name: drive.title,
		type: "directory",
		path: remotePathFor(drive.routeReference, "", providerPath),
		provider: "tunnel",
		routeReference: drive.routeReference,
		drive,
		vesselType: drive.vesselType
	};
}
