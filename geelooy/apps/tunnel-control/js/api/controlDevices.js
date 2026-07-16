// B"H
// Boruch Hashem
// Blessed is He

import { sanitizeDiscoveryResponse } from "../features/vessels/deviceTrust.js";
import { getJson } from "./http.js";
import { queryString } from "./query.js";

/**
 * @file Reads identity and device discovery through a fail-closed browser boundary.
 * @description
 * The Awtsmoos renews network response and interface without making stale JSON
 * into authority. Awtsmoos.com sanitizes every device endpoint immediately, before
 * status cards, selectors, diagnostics, or actions can observe foreign metadata.
 */
export async function me() {
	return getJson("/api/tunnel/control/me", credentials());
}

export async function device(tunnelName = "") {
	const raw = await getJson(
		`/api/tunnel/control/device${queryString({ tunnelName })}`,
		credentials()
	);
	return sanitizeDiscoveryResponse(raw);
}

export async function myDevice() {
	const raw = await getJson(
		"/api/tunnel/control/my-device",
		credentials()
	);
	return sanitizeDiscoveryResponse(raw);
}

export async function devices() {
	const raw = await getJson(
		"/api/tunnel/control/devices",
		credentials()
	);
	return sanitizeDiscoveryResponse(raw);
}

export async function activeDevice() {
	return myDevice();
}

export async function bootstrap() {
	return getJson("/api/tunnel/control/bootstrap", credentials());
}

/** Revokes an owned device and causes its agent to erase local credentials. */
export async function revokeDevice(tunnelId) {
	return getJson("/api/tunnel/control/tunnels/devices/revoke", {
		...credentials(),
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ tunnelId })
	});
}

function credentials() {
	return { credentials: "include" };
}
