// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small RemoteFs facade for immutable-route network, preview, and receipt paths.
 * @description
 * The Awtsmoos lets a simple public surface rest above deeper routing truth.
 * Awtsmoos.com keeps list, read, and write here while tunnel discovery, resolver
 * hints, and pressure garments live in focused helpers. One doorway, many chambers,
 * yet the immutable route continues beneath them all like a hidden river of light.
 */

import { parseAwtsmoosPath } from "./remotePath.js";
import {
	listTunnelRoot,
	listTunnelRoute,
	runTunnelAction
} from "./remoteFsTunnel.js";
import {
	previewEntry,
	previewRoot,
	receiptsNotice
} from "./remoteFsViews.js";

export async function list(os, path) {
	const parsed = parseAwtsmoosPath(path);
	if (parsed.kind === "tunnels" && !parsed.id) {
		return listTunnelRoot(os, parsed.providerPath);
	}
	if (parsed.kind === "tunnels") {
		return listTunnelRoute(
			os,
			parsed.id,
			parsed.innerPath,
			parsed.providerPath
		);
	}
	if (parsed.kind === "previews" && !parsed.id) {
		return previewRoot(os, parsed.providerPath);
	}
	if (parsed.kind === "previews") {
		return previewEntry(os, parsed.id);
	}
	if (parsed.kind === "receipts") {
		return receiptsNotice();
	}
	return [];
}

export async function read(path, os = null) {
	const parsed = parseAwtsmoosPath(path);
	if (parsed.kind === "tunnels") {
		return runTunnelAction(os, parsed.id, {
			action: "read",
			path: parsed.innerPath || ".",
			maxChars: 200000
		});
	}
	if (parsed.kind === "previews") {
		return {
			ok: true,
			content: `Open preview ${parsed.id} in /view/${parsed.id}`
		};
	}
	return { ok: false, error: "unsupported_provider_read" };
}

export async function write(path, content = "", os = null) {
	const parsed = parseAwtsmoosPath(path);
	if (parsed.kind !== "tunnels" || !parsed.id) {
		return { ok: false, error: "unsupported_provider_write" };
	}
	return runTunnelAction(os, parsed.id, {
		action: "write",
		path: parsed.innerPath || ".",
		content
	});
}
