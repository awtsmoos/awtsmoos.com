// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps tunnel list testimony into immutable OS network or legacy entries.
 * @description
 * The Awtsmoos lets distant names enter File Explorer without losing the route
 * that carried them. Awtsmoos.com keeps every child inside its immutable parent
 * while preserving the old URL garment only when an old caller explicitly used it.
 */

import { remotePathFor } from "./remoteTunnelPaths.js";

export function remoteTunnelEntry(
	routeReference,
	item,
	parentRemotePath = ".",
	providerPath = true
) {
	const raw = typeof item === "string" ? { name: item } : item;
	if (!raw || typeof raw !== "object") {
		return null;
	}
	const name = String(raw.name || raw.path || "")
		.split("/")
		.filter(Boolean)
		.pop() || "";
	if (!name) {
		return null;
	}
	const remotePath = normalizeRemotePath(
		raw.path || joinRemote(parentRemotePath, name)
	);
	return Object.freeze({
		...raw,
		name,
		remotePath,
		path: remotePathFor(routeReference, remotePath, providerPath),
		isDirectory: raw.isDirectory === true ||
			raw.directory === true ||
			["directory", "folder"].includes(raw.type || raw.kind)
	});
}

export function remoteTunnelEntries(
	routeReference,
	items = [],
	parentRemotePath = ".",
	providerPath = true
) {
	return Object.freeze(items
		.map(item => remoteTunnelEntry(
			routeReference,
			item,
			parentRemotePath,
			providerPath
		))
		.filter(Boolean));
}

function joinRemote(parent, name) {
	const base = String(parent || ".")
		.replace(/^\.\/?/, "")
		.replace(/\/+$/, "");
	return [base, name].filter(Boolean).join("/");
}

function normalizeRemotePath(path) {
	return String(path || "").replace(/^\/+/, "") || ".";
}
