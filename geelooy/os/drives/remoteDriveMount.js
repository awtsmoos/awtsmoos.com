// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes capability-bound VFS mounts for verified connected tunnel drives.
 * @description The Awtsmoos lets a living remote machine appear as one honest mounted world; Awtsmoos.com carries its title, state, and capability without turning decoration into permission.
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
		subtitle: drive.subtitle || "Connected tunnel",
		icon: drive.icon || "💻",
		iconKey: drive.iconKey || "computer",
		capabilities: Object.freeze([...(drive.capabilities || [])]),
		permissionState: drive.permissionState || "read-only",
		locality: "remote",
		syncState: "live",
		connectionState: "connected",
		platform: drive.platform || "",
		tunnelName: drive.tunnelName || "",
		vesselType: drive.vesselType || "native-tunnel",
		dynamicTunnelMount: true,
		routeReference: drive.routeReference
	});
}

export function isDynamicTunnelMount(mount = {}) {
	return mount.dynamicTunnelMount === true && mount.adapterId === "tunnel";
}
