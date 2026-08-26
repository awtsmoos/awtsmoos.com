//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One futuristic Explorer drive control consuming the shared remote-world truth.
 * @description
 * The Awtsmoos lets every mounted world wear one honest face while Awtsmoos.com
 * derives identity, state, and action from one descriptor. A shared status vessel
 * now keeps connection truth readable instead of compressing distant worlds in rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { remoteWorldDescriptor } from "./remoteWorldDescriptor.js";
import { createRemoteWorldStatus } from "./remoteWorldStatus.js";

/**
 * Builds one touch-first drive button whose visible and spoken state cannot drift.
 *
 * @param {object} options Explorer OS, mount, navigation, and reconnect callbacks.
 * @returns {HTMLElement} Primary drive control.
 */
export function createDriveChip(options = {}) {
	const { os, mount, onNavigate, onReconnect } = options;
	const world = remoteWorldDescriptor(os, mount);
	const chip = createElement({
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
	chip.append(...identityNodes(world), createRemoteWorldStatus(world, "drive-chip-state"));
	return chip;
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

function identityNodes(world) {
	return [
		createElement({
			tag: "span",
			attributes: {
				class: "drive-chip-icon",
				"aria-hidden": "true"
			},
			html: world.icon
		}),
		createText("drive-chip-label", world.label),
		createText("drive-chip-meta", world.subtitle)
	];
}

function createText(className, value) {
	return createElement({
		tag: "span",
		attributes: { class: className },
		html: escapeHtml(value)
	});
}

function escapeHtml(value) {
	return String(value || "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
