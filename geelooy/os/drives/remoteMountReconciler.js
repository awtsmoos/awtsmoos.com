//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Stable reconciliation for live tunnel VFS mounts without destructive no-op remounts.
 * @description
 * The Awtsmoos renews reality every instant, yet unchanged remote truth need not
 * tear down its vessel every fifteen seconds. Awtsmoos.com compares the fields
 * that affect access and presentation, remounting only when their revealed light differs in rhyme.
 */
import { isDynamicTunnelMount, remoteDriveMount } from "./remoteDriveMount.js";

/**
 * Reconciles desired tunnel drives with the existing VFS mount set.
 *
 * @param {object} vfs Virtual filesystem registry exposing mounts/mount/unmount.
 * @param {Array<object>} drives Current verified live tunnel drive records.
 * @returns {{mounted:number,removed:number,unchanged:number}} Reconciliation counts.
 */
export function reconcileRemoteMounts(vfs, drives = []) {
	if (!vfs?.mounts || !vfs?.mount || !vfs?.unmount) {
		return { mounted: 0, removed: 0, unchanged: 0 };
	}
	const desired = new Map(drives.map(drive => {
		const mount = remoteDriveMount(drive);
		return [mount.id, mount];
	}));
	const current = new Map(
		vfs.mounts()
			.filter(isDynamicTunnelMount)
			.map(mount => [mount.id, mount])
	);
	let removed = 0;
	let mounted = 0;
	let unchanged = 0;
	for (const [id] of current) {
		if (!desired.has(id)) {
			vfs.unmount(id);
			removed += 1;
		}
	}
	for (const [id, mount] of desired) {
		const existing = current.get(id);
		if (existing && remoteMountSignature(existing) === remoteMountSignature(mount)) {
			unchanged += 1;
			continue;
		}
		if (existing) {
			vfs.unmount(id, { silent: true });
		}
		vfs.mount(mount);
		mounted += 1;
	}
	return { mounted, removed, unchanged };
}

/**
 * Creates a deterministic signature from fields that change mount behavior or visible identity.
 *
 * @param {object} mount Remote VFS mount.
 * @returns {string} Stable comparison key.
 */
export function remoteMountSignature(mount = {}) {
	return JSON.stringify({
		prefix: mount.prefix || "",
		providerId: mount.providerId || "",
		title: mount.title || "",
		subtitle: mount.subtitle || "",
		icon: mount.icon || "",
		permissionState: mount.permissionState || "",
		platform: mount.platform || "",
		vesselType: mount.vesselType || "",
		permissions: orderedObject(mount.permissions),
		capabilities: [...(mount.capabilities || [])].sort()
	});
}

function orderedObject(value = {}) {
	return Object.fromEntries(
		Object.entries(value || {}).sort(([left], [right]) => left.localeCompare(right))
	);
}
