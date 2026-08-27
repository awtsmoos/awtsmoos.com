// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes capability-bound VFS mounts for verified remote drives.
 * @description
 * The Awtsmoos gives Chesed the power to read and sometimes write, while
 * Gevurah decides exactly how far that light may travel. Awtsmoos.com derives
 * each permission from verified capability, never from a provider label alone.
 */

export function remoteDriveMount(drive = {}) {
	return Object.freeze({
		id: `mount:tunnel:${drive.routeReference}`,
		prefix: drive.root,
		adapterId: "tunnel",
		permissions: Object.freeze({
			read: true,
			list: true,
			write: drive.canWrite === true,
			delete: false
		}),
		provider: "tunnel",
		providerId: drive.routeReference,
		title: drive.title,
		icon: drive.icon || "🛰️",
		iconKey: drive.iconKey || "network",
		dynamicTunnelMount: true,
		routeReference: drive.routeReference
	});
}

export function isDynamicTunnelMount(mount = {}) {
	return mount.dynamicTunnelMount === true && mount.adapterId === "tunnel";
}
