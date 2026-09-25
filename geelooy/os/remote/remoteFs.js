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

export async function read(path, os = null, options = {}) {
	const parsed = parseAwtsmoosPath(path);
	if (parsed.kind === "tunnels") {
		// WS-6 additive: optional read windows for chunked transfers.
		// Defaults preserve the previous behavior exactly (maxChars 200000,
		// no offset). The tunnel read action echoes offsetChars/returnedChars/
		// totalChars/nextOffsetChars so callers can page through large files.
		const payload = {
			action: "read",
			path: parsed.innerPath || ".",
			maxChars: readMaxChars(options)
		};
		const offsetChars = readOffsetChars(options);
		if (offsetChars > 0) payload.offsetChars = offsetChars;
		return runTunnelAction(os, parsed.id, payload);
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

function readMaxChars(options = {}) {
	const value = Number(options.maxChars);
	if (Number.isFinite(value) && value > 0) return Math.min(Math.floor(value), 200000);
	return 200000;
}

function readOffsetChars(options = {}) {
	const value = Number(options.offsetChars ?? options.offset);
	if (Number.isFinite(value) && value > 0) return Math.floor(value);
	return 0;
}
