// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mount presentation truth for File Explorer drive surfaces.
 * @description The Awtsmoos lets local, tunnel, SSH, preview, and virtual worlds keep distinct garments; Awtsmoos.com renders their state from mount truth instead of guessing by path.
 */
import { providerCapabilities } from "../../../providers/capabilities.js";

const ICONS = Object.freeze({
	virtual: "א",
	memory: "🧠",
	tunnel: "💻",
	ssh: "🔐",
	git: "🌿",
	zip: "🗜️",
	api: "🔌",
	preview: "🔭",
	receipt: "🧾",
	local: "💾"
});

export function classForMount(mountOrAdapter = "") {
	return `mount-${providerOf(mountOrAdapter)}`;
}

export function iconForMount(mount = {}) {
	return mount.icon || ICONS[providerOf(mount)] || "◌";
}

export function labelForMount(mount = {}) {
	return mount.title || mount.name || mount.providerId || mount.adapterId || "Awtsmoos Object";
}

export function mountBadge(mount = {}, permission = {}) {
	const provider = providerOf(mount);
	const state = connectionLabel(mount);
	const access = permissionLabel(mount, permission);
	return [state, providerLabel(provider), access].filter(Boolean).join(" · ");
}

export function mountSubtitle(mount = {}) {
	return mount.subtitle || mount.platform || mount.tunnelName || capabilityLabel(mount);
}

export function resolveMount(os, path = "/") {
	const resolved = os?.vfs?.resolve?.(path) || os?.drives?.resolve?.(path);
	return resolved?.mount || resolved?.drive || os?.vfs?.mounts?.()?.[0] || {};
}

export function mountData(os, path = "/", permission = {}) {
	const mount = resolveMount(os, path);
	return {
		...mount,
		provider: providerOf(mount),
		className: classForMount(mount),
		icon: iconForMount(mount),
		label: labelForMount(mount),
		badge: mountBadge(mount, permission),
		subtitle: mountSubtitle(mount)
	};
}

function providerOf(input) {
	if (typeof input === "string") {
		return input.replace(/^mount-/, "") || "virtual";
	}
	return input.provider || input.providerKind || input.adapterType || input.kind || "virtual";
}

function connectionLabel(mount = {}) {
	if (mount.connectionState === "connected" || mount.syncState === "live") {
		return "Connected";
	}
	if (mount.syncState === "snapshot") {
		return "Snapshot";
	}
	if (providerOf(mount) === "ssh" && mount.connected === false) {
		return "Needs credential";
	}
	return "Ready";
}

function permissionLabel(mount = {}, permission = {}) {
	const value = permission.permission || mount.permissionState || (mount.writable ? "read-write" : "read-only");
	return value === "read-write" ? "Read & write" : "Read only";
}

function providerLabel(provider) {
	return provider === "tunnel" ? "Tunnel" : provider === "ssh" ? "SSH" : provider;
}

function capabilityLabel(mount = {}) {
	return providerCapabilities(mount).slice(0, 4).join(" · ");
}
