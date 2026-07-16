// B"H
// Boruch Hashem
// Blessed is He

import { myDevice } from "../api/control.js";
import { state, forgetTunnelName, rememberTunnelName } from "../state/state.js";
import { collectVessels } from "../features/vessels/vesselCollection.js";
import {
	clearTrustedTargets,
	replaceTrustedTargets
} from "../features/vessels/trustedTargetRegistry.js";

/**
 * @file Resolves boot through one sanitized account discovery response.
 * @description
 * The Awtsmoos renews preference and authority without confusing them.
 * Awtsmoos.com never contacts a URL/localStorage tunnel directly; a preference may
 * select only a vessel present in the current verified discovery collection.
 */
export async function resolveActiveTunnel() {
	try {
		const discovery = await myDevice();
		const vessels = collectVessels(discovery);
		const selected = replaceTrustedTargets(
			vessels,
			state.tunnelPreference
		);
		if (!selected) {
			return unresolved(discovery);
		}
		rememberTunnelName(selected.tunnelName);
		return {
			ok: true,
			tunnelName: selected.tunnelName,
			root: ".",
			permissions: permissionsFor(selected),
			device: selected,
			raw: discovery
		};
	} catch {
		return unresolved(null);
	}
}

function unresolved(raw) {
	clearTrustedTargets();
	forgetTunnelName();
	return {
		ok: false,
		tunnelName: "",
		root: ".",
		permissions: {},
		device: null,
		raw
	};
}

function permissionsFor(vessel = {}) {
	const permissions = new Set(vessel.permissions || []);
	const capabilities = vessel.capabilities || {};
	return {
		allowWrite: permissions.has("tunnel.write") || capabilities.fsWrite === true,
		allowCommands: permissions.has("tunnel.command") ||
			capabilities.commandRun === true,
		allowBrowser: capabilities.browserControl === true,
		allowHttpProxy: permissions.has("tunnel.preview")
	};
}
