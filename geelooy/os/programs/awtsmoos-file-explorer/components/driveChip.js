//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One futuristic Explorer drive control consuming the shared remote-world truth.
 * @description
 * The Awtsmoos lets every mounted world wear one honest face while Awtsmoos.com
 * derives state, speech, and action from a single descriptor. Living worlds open;
 * locked SSH worlds ask for fresh credential light, and accessibility joins the rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { remoteWorldDescriptor } from "./remoteWorldDescriptor.js";

/**
 * Builds one touch-first drive button whose visible and spoken state cannot drift.
 *
 * @param {object} options Explorer OS, mount, navigation, and reconnect callbacks.
 * @returns {HTMLElement} Primary drive control.
 */
export function createDriveChip(options = {}) {
	const { os, mount, onNavigate, onReconnect } = options;
	const world = remoteWorldDescriptor(os, mount);
	return createElement({
		tag: "button",
		attributes: {
			class: `drive-chip ${world.className}`,
			type: "button",
			title: world.ariaLabel,
			"aria-label": world.ariaLabel,
			"data-provider": world.provider,
			"data-permission": mount.permissionState || "read-write",
			"data-state": world.state,
			"data-reconnectable": world.reconnectable ? "yes" : "no"
		},
		children: childrenFor(world),
		on: {
			click: () => activate({
				os,
				mount,
				world,
				onNavigate,
				onReconnect
			})
		}
	});
}

function activate(options) {
	if (!options.world.reconnectable) {
		options.onNavigate?.(options.mount.prefix);
		return;
	}
	const profileName = options.mount.data?.profileName ||
		options.mount.sshProfile ||
		options.mount.providerId;
	const profile = options.os?.ssh?.vault?.get?.(profileName) || {};
	options.onReconnect?.(profile);
}

function childrenFor(world) {
	return [
		{
			tag: "span",
			attributes: {
				class: "drive-chip-icon",
				"aria-hidden": "true"
			},
			html: world.icon
		},
		{
			tag: "span",
			attributes: { class: "drive-chip-label" },
			html: escapeHtml(world.label)
		},
		{
			tag: "small",
			attributes: { class: "drive-chip-meta" },
			html: escapeHtml(world.subtitle)
		},
		{
			tag: "small",
			attributes: { class: "drive-chip-state" },
			html: escapeHtml(`${world.stateLabel} · ${world.action}`)
		}
	];
}

function escapeHtml(value) {
	return String(value || "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
