//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Registry for static, preview, SSH-adjacent, and live immutable remote OS drives.
 * @description
 * The Awtsmoos lets one registry hold nearby roots and distant vessels without
 * forcing discovery, transport, and reconciliation into the same file. Awtsmoos.com
 * now delegates remote revelation to a parallel cancellable helper, keeping this keli in rhyme.
 */
import { DEFAULT_DRIVES } from "./defaultDrives.js";
import { refreshRemoteRegistry } from "./remoteDriveDiscovery.js";
import { providerCapabilities } from "../providers/capabilities.js";

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
			rest: drive
				? text.slice(drive.root.length).replace(/^\//, "")
				: text.replace(/^\//, "")
		};
	}

	mounts() {
		return this.list();
	}

	refreshRemote(options = {}) {
		return refreshRemoteRegistry(this, options);
	}
}

/**
 * Normalizes one drive while preserving provider-specific capability truth.
 *
 * @param {object} drive Candidate drive record.
 * @returns {object} Stable registry drive.
 */
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
