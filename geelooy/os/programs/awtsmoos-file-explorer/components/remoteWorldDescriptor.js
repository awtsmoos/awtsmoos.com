//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One truthful presentation descriptor for every Explorer-mounted world.
 * @description
 * The Awtsmoos creates local, tunnel, SSH, preview, and virtual worlds in one
 * continuous renewal; Awtsmoos.com lets card, sidebar, title, ARIA, and action
 * all drink from the same state river, so visible truth and behavior rhyme.
 */
import {
	classForMount,
	iconForMount,
	labelForMount,
	mountBadge,
	mountSubtitle
} from "../utils/mountClass.js";

/**
 * Normalizes one mount into a shared, action-aware visual and accessibility model.
 *
 * @param {object} os Active Geelooy OS instance.
 * @param {object} mount VFS or DriveRegistry-shaped mount record.
 * @returns {object} Stable descriptor consumed by all remote-world surfaces.
 */
export function remoteWorldDescriptor(os, mount = {}) {
	const permission = os?.vfs?.can?.(mount.prefix, "read") || {};
	const provider = providerOf(mount);
	const state = stateOf(mount, provider);
	const label = labelForMount(mount);
	const badge = mountBadge(mount, permission);
	const subtitle = mountSubtitle(mount) || badge;
	const reconnectable = provider === "ssh" && state === "needs-credential";
	const action = reconnectable ? "Reconnect" : "Open";
	const stateLabel = stateCopy(state);
	return {
		provider,
		state,
		label,
		badge,
		subtitle,
		reconnectable,
		action,
		stateLabel,
		className: classForMount(mount),
		icon: iconForMount(mount),
		ariaLabel: `${label}. ${providerCopy(provider)}. ${stateLabel}. ${badge}. ${action}.`
	};
}

/**
 * Returns concise human copy for one normalized connection state.
 *
 * @param {string} state Canonical state name.
 * @returns {string} Visible state label.
 */
export function stateCopy(state = "ready") {
	return ({
		connected: "Connected",
		connecting: "Connecting",
		"needs-credential": "Needs credential",
		offline: "Offline",
		error: "Connection issue",
		snapshot: "Snapshot",
		ready: "Ready"
	})[state] || "Ready";
}

function stateOf(mount, provider) {
	const raw = String(
		mount.connectionState || mount.syncState || mount.status || ""
	).toLowerCase();
	if (provider === "ssh" && (
		mount.permissionState === "locked" ||
		mount.connected === false ||
		raw === "needs-credential"
	)) {
		return "needs-credential";
	}
	if (/error|failed|failure|unhealthy/.test(raw)) {
		return "error";
	}
	if (/connecting|loading|refreshing|pending/.test(raw)) {
		return "connecting";
	}
	if (/connected|live/.test(raw) || mount.connected === true) {
		return "connected";
	}
	if (/snapshot/.test(raw)) {
		return "snapshot";
	}
	if (/offline|disconnected|stale/.test(raw) || mount.connected === false) {
		return "offline";
	}
	return "ready";
}

function providerOf(mount) {
	return mount.provider || mount.adapterId || mount.kind || "virtual";
}

function providerCopy(provider) {
	if (provider === "ssh") {
		return "SSH computer";
	}
	if (provider === "tunnel") {
		return "Account tunnel";
	}
	return String(provider || "virtual");
}
