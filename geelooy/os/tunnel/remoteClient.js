// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Same-origin remote tunnel transport for the Geelooy OS workspace.
 * @description
 * The Awtsmoos lets OS speak the existing Tunnel Control API without rebuilding
 * target policy here. Awtsmoos.com keeps immutable route in the URL and canonical
 * action JSON in POST bodies while a separate target module owns discovery models.
 */

import { collectTargets } from "./remoteTargets.js";

export { collectTargets } from "./remoteTargets.js";

export async function discoverTunnelTargets(fetcher = globalThis.fetch) {
	const data = await jsonRequest(
		fetcher,
		"/api/tunnel/control/my-device"
	);
	return Object.freeze(collectTargets(data));
}

export async function tunnelAction(
	target,
	payload,
	fetcher = globalThis.fetch
) {
	const route = String(target?.route || "").trim();
	if (!route) {
		throw new Error("A verified immutable tunnel route is required.");
	}
	const path = `/api/tunnel/control/fs/${encodeURIComponent(route)}`;
	return jsonRequest(fetcher, path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(cleanPayload(payload))
	});
}

export function listRemote(
	target,
	path = ".",
	fetcher = globalThis.fetch
) {
	return tunnelAction(target, {
		action: "list",
		p: path
	}, fetcher);
}

export function readRemote(
	target,
	path,
	fetcher = globalThis.fetch
) {
	return tunnelAction(target, {
		action: "read",
		p: path
	}, fetcher);
}

async function jsonRequest(fetcher, url, options = {}) {
	const response = await fetcher(url, {
		credentials: "same-origin",
		headers: {
			Accept: "application/json",
			...(options.headers || {})
		},
		...options
	});
	const data = await response.json();
	if (!response.ok || data?.ok === false) {
		throw new Error(
			data?.error || `Tunnel request failed (${response.status}).`
		);
	}
	return data;
}

function cleanPayload(payload = {}) {
	return Object.fromEntries(
		Object.entries(payload).filter(([, value]) => {
			return value !== undefined && value !== null && value !== "";
		})
	);
}
