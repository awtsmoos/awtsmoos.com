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
import { observePendingReceipt } from "../remote/tunnelObserveReceipt.js";

export { collectTargets } from "./remoteTargets.js";

export async function discoverTunnelTargets(fetcher = globalThis.fetch) {
	// B"H - discovery enumerates via /devices, the same source File
	// Explorer uses. Bare /my-device is a single-device selector: it can
	// refuse with an ambiguity or identity error while /devices answers,
	// which left this panel's vessel list empty and its files pane
	// showing that error while Files browsed the same device fine.
	const data = await jsonRequest(
		fetcher,
		"/api/tunnel/control/devices"
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
	const first = await jsonRequest(fetcher, path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(cleanPayload(payload))
	});
	// B"H - same receipt doctrine as the Explorer client: a slow device
	// answers with a pending control receipt, which reads as empty data
	// unless observed via retryAction to its terminal response. Command
	// deeds are exempt inside the observer (their callers own job handles).
	return observePendingReceipt(first, {
		action: payload?.action,
		postObserve: (body) => jsonRequest(fetcher, path, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		})
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
