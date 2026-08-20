// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Live Explorer sidebar for every mounted local and remote world.
 * @description The Awtsmoos lets hierarchy remain simple while each connected vessel shows its own status; Awtsmoos.com keeps navigation direct and identity bright without path guesswork.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { getChevronIcon } from "../utils/icons.js";
import {
	classForMount,
	iconForMount,
	labelForMount,
	mountBadge,
	mountSubtitle
} from "../utils/mountClass.js";

export default function createSidebar({ os, onNavigate }) {
	const sidebar = createElement({
		tag: "div",
		attributes: { class: "file-explorer-sidebar" }
	});
	const heading = createElement({
		tag: "div",
		attributes: { class: "sidebar-heading" },
		html: "Locations"
	});
	const root = createElement({
		tag: "ul",
		attributes: { class: "tree-root" }
	});
	sidebar.append(heading, root);

	function rebuild() {
		root.replaceChildren(...nodes(os, onNavigate));
	}

	function syncSelection(path) {
		sidebar.querySelectorAll(".tree-node-content.selected").forEach(element => {
			element.classList.remove("selected");
		});
		const selected = sidebar.querySelector(`[data-full-path="${css(path)}"] .tree-node-content`);
		selected?.classList.add("selected");
	}

	rebuild();
	return { dom: sidebar, syncSelection, rebuild };
}

function nodes(os, onNavigate) {
	const mounts = os?.vfs?.mounts?.() || [];
	const items = mounts.map(mount => mountNode(mount, onNavigate));
	const mountedPaths = new Set(mounts.map(mount => mount.prefix));
	for (const drive of os?.drives?.list?.() || []) {
		if (!mountedPaths.has(drive.root)) {
			items.push(mountNode({ ...drive, prefix: drive.root }, onNavigate));
		}
	}
	return items;
}

function mountNode(mount, onNavigate) {
	const li = createElement({
		tag: "li",
		attributes: {
			"data-full-path": mount.prefix,
			class: `tree-node drive-node ${classForMount(mount)}`,
			"data-state": mount.connectionState || mount.syncState || "ready",
			"data-provider": mount.provider || mount.adapterId || "drive"
		}
	});
	const row = createElement({
		tag: "button",
		attributes: {
			class: "tree-node-content",
			type: "button",
			title: mountBadge(mount)
		},
		on: { click: () => onNavigate(mount.prefix) }
	});
	row.append(
		createElement({
			tag: "span",
			attributes: { class: "toggle-icon" },
			html: getChevronIcon()
		}),
		createElement({
			tag: "span",
			attributes: { class: "node-provider-icon" },
			html: iconForMount(mount)
		}),
		textBlock(mount)
	);
	li.appendChild(row);
	return li;
}

function textBlock(mount) {
	return createElement({
		tag: "span",
		attributes: { class: "node-copy" },
		children: [
			{ tag: "span", attributes: { class: "node-name" }, html: escapeHtml(labelForMount(mount)) },
			{ tag: "small", attributes: { class: "node-meta" }, html: escapeHtml(mountSubtitle(mount) || mountBadge(mount)) }
		]
	});
}

function css(value) {
	return String(value || "").replace(/"/g, "\\\"");
}

function escapeHtml(value) {
	return String(value || "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
