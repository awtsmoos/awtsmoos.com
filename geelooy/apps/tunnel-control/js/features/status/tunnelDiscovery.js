// B"H
// Boruch Hashem
// Blessed is He

import { $ } from "../../lib/dom.js";
import { rememberTunnelName } from "../../state/state.js";

/**
 * @file Applies the strongest verified route identity exposed by discovery.
 * @description
 * The Awtsmoos renews a vessel's friendly name and authoritative tunnel ID without
 * confusing their purposes. Awtsmoos.com prefers the ID for routing and falls back
 * to the readable alias only for older discovery responses.
 */
export function extractTunnelReference(discovery = {}) {
	const candidates = [
		discovery.recommended,
		discovery.device,
		discovery.tunnel,
		discovery,
		discovery.virtualDevice
	].filter(Boolean);
	for (const candidate of candidates) {
		const reference = String(
			candidate.tunnelId || candidate.routeReference || candidate.tunnelName ||
			candidate.name || ""
		).trim();
		if (reference) return reference;
	}
	return "";
}

export function extractTunnelName(discovery = {}) {
	return extractTunnelReference(discovery);
}

export function applyDiscoveredTunnelName(discovery, getTunnelName) {
	const current = getTunnelName();
	if (current) return current;
	const discovered = extractTunnelReference(discovery);
	if (!discovered) return "";
	const field = $("tunnelName");
	if (field) field.value = discovered;
	rememberTunnelName(discovered);
	return discovered;
}
