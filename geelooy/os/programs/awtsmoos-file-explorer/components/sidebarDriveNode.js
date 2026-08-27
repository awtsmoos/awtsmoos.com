//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file One mounted-world sidebar row consuming the shared remote-world descriptor.
 * @description
 * The Awtsmoos lets shelf and sidebar reveal the same distant truth through
 * different vessels. Awtsmoos.com removes duplicate connection law here so the
 * row's state, spoken action, and reconnect behavior stay joined in one rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { getChevronIcon } from "../utils/icons.js";
import { openSshDriveDialog } from "./sshDriveDialog.js";
import { remoteWorldDescriptor } from "./remoteWorldDescriptor.js";

/**
 * Builds one broad touch row for a local or remote mounted world.
 *
 * @param {object} options OS, mount, navigation, and mount-refresh callbacks.
 * @returns {HTMLElement} Sidebar list item.
 */
export function createSidebarDriveNode(options = {}) {
	const { os, mount } = options;
	const world = remoteWorldDescriptor(os, mount);
	const item = createElement({
		tag: "li",
		attributes: {
			"data-full-path": mount.prefix,
			class: `tree-node drive-node ${world.className}`,
			"data-state": world.state,
			"data-provider": world.provider,
			"data-reconnectable": world.reconnectable ? "yes" : "no"
		}
	});
	const row = createElement({
		tag: "button",
		attributes: {
			class: "tree-node-content",
			type: "button",
			title: world.ariaLabel,
			"aria-label": world.ariaLabel
		},
		on: {
			click: () => activate(options, world)
		}
	});
	row.append(
		iconNode("toggle-icon", getChevronIcon()),
		iconNode("node-provider-icon", world.icon),
		textBlock(world)
	);
	item.appendChild(row);
	return item;
}

function activate(options, world) {
	if (!world.reconnectable) {
		options.onNavigate?.(options.mount.prefix);
		return;
	}
	const profileName = options.mount.data?.profileName ||
		options.mount.sshProfile ||
		options.mount.providerId;
	const profile = options.os?.ssh?.vault?.get?.(profileName) || {};
	openSshDriveDialog({
		os: options.os,
		profile,
		onNavigate: options.onNavigate,
		onMounted: options.onMounted
	});
}

function iconNode(className, html) {
	return createElement({
		tag: "span",
		attributes: {
			class: className,
			"aria-hidden": "true"
		},
		html
	});
}

function textBlock(world) {
	return createElement({
		tag: "span",
		attributes: { class: "node-copy" },
		children: [
			{
				tag: "span",
				attributes: { class: "node-name" },
				html: escapeHtml(world.label)
			},
			{
				tag: "small",
				attributes: { class: "node-meta" },
				html: escapeHtml(`${world.stateLabel} · ${world.action}`)
			}
		]
	});
}

function escapeHtml(value) {
	return String(value || "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
