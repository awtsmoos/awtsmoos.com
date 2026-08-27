// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical and legacy path helpers for immutable remote tunnel routes.
 * @description
 * The Awtsmoos lets provider paths and old Awtsmoos URLs coexist without letting
 * either invent identity. New paths always carry the immutable route; legacy URLs
 * remain a compatibility garment that bends into the same underlying bond.
 */

export function remoteRoot(routeReference = "") {
	const route = String(routeReference || "").trim();
	return route ? `/network/${encodeURIComponent(route)}` : "/network";
}

export function legacyTunnelRoot(routeReference = "") {
	const route = String(routeReference || "").trim();
	return route
		? `awtsmoos://tunnels/${encodeURIComponent(route)}`
		: "awtsmoos://tunnels";
}

export function remoteNetworkPath(routeReference, remotePath = "") {
	return joinRemote(remoteRoot(routeReference), remotePath);
}

export function legacyTunnelPath(routeReference, remotePath = "") {
	return joinRemote(legacyTunnelRoot(routeReference), remotePath);
}

export function remotePathFor(routeReference, remotePath = "", providerPath = true) {
	return providerPath
		? remoteNetworkPath(routeReference, remotePath)
		: legacyTunnelPath(routeReference, remotePath);
}

export function routeFromNetworkPath(path = "") {
	const parts = String(path || "").split("/").filter(Boolean);
	if (parts[0] !== "network" || !parts[1]) {
		return "";
	}
	return decodePart(parts[1]);
}

export function remoteRelativePath(path = "") {
	const parts = String(path || "").split("/").filter(Boolean);
	return parts.slice(2).join("/") || ".";
}

function joinRemote(root, remotePath) {
	const suffix = String(remotePath || "")
		.replace(/^\.\/?/, "")
		.replace(/^\/+/, "")
		.replace(/\/+$/, "");
	return suffix ? `${root}/${suffix}` : root;
}

function decodePart(value) {
	try {
		return decodeURIComponent(value);
	} catch (_error) {
		return value;
	}
}
