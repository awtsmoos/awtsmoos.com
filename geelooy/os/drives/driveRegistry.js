// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Registry for static, preview, and live immutable remote OS drives.
 * @description
 * The Awtsmoos lets one shelf hold local roots, previews, and distant vessels
 * without asking the Explorer how far they live. Awtsmoos.com keeps old lookup
 * garments compatible while live tunnel synchronization binds every new remote
 * mount to its immutable route and releases stale shadows without touching home.
 */

import { DEFAULT_DRIVES } from "./defaultDrives.js";
import * as Client from "../remote/tunnelControlClient.js";
import { previewDrive } from "./tunnelDriveMapper.js";
import { providerCapabilities } from "../providers/capabilities.js";
import { syncRemoteDrives } from "./remoteDriveSync.js";

export class DriveRegistry {
	constructor(os, drives = DEFAULT_DRIVES) {
		this.os = os;
		this.drives = drives.map(normalizeDrive);
		this.lastRefresh = 0;
	}

	list() {
		return this.drives.map(drive => ({ ...drive }));
	}

	get(id) {
		return this.drives.find(drive => {
			return drive.id === id ||
				drive.root === id ||
				drive.url === id ||
				drive.routeReference === id ||
				drive.tunnelName === id;
		}) || null;
	}

	mount(drive) {
		const next = normalizeDrive(drive);
		const old = this.get(next.id);
		if (old) {
			Object.assign(old, next);
		} else {
			this.drives.push(next);
		}
		return this.get(next.id);
	}

	unmount(id) {
		const drive = this.get(id);
		const count = this.drives.length;
		this.drives = this.drives.filter(item => item.id !== drive?.id);
		if (drive?.dynamicTunnelDrive && drive.routeReference) {
			this.os?.vfs?.unmount?.(`mount:tunnel:${drive.routeReference}`);
		}
		return count !== this.drives.length;
	}

	resolve(path = "/") {
		const text = String(path || "/");
		const match = [...this.drives]
			.sort((left, right) => right.root.length - left.root.length)
			.find(drive => matchesDrive(text, drive));
		const drive = match || this.get("home");
		return {
			drive,
			mount: drive,
			rest: drive ? text.slice(drive.root.length).replace(/^\//, "") : text.replace(/^\//, "")
		};
	}

	mounts() {
		return this.list();
	}

	async refreshRemote() {
		const devices = await Client.devices().catch(error => ({
			ok: false,
			error: error.message,
			devices: []
		}));
		if (devices.ok !== false) {
			syncRemoteDrives(this, devices);
		}
		const previews = await Client.previewList().catch(() => ({ previews: [] }));
		for (const preview of (previews.previews || []).slice(0, 50)) {
			this.mount(previewDrive(preview));
		}
		this.lastRefresh = Date.now();
		return { devices, previews };
	}
}

export function normalizeDrive(drive = {}) {
	const provider = drive.provider || drive.kind || "virtual";
	return {
		...drive,
		kind: provider,
		provider,
		providerId: drive.providerId || drive.routeReference || drive.tunnelName || provider,
		capabilities: providerCapabilities({ ...drive, provider }),
		url: drive.url || `awtsmoos://mount${drive.root || "/"}`
	};
}

export function makeDriveRegistry(os) {
	return new DriveRegistry(os);
}

function matchesDrive(path, drive) {
	return path === drive.root ||
		path.startsWith(`${drive.root}/`) ||
		path === drive.url;
}
