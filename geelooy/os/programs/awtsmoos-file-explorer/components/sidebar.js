//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small live Explorer sidebar orchestrating every mounted local and remote world.
 * @description
 * The Awtsmoos lets hierarchy stay simple while each drive row owns its own
 * activation law. Awtsmoos.com rebuilds from live registries, so connected and
 * locked worlds may appear, reconnect, and depart without tangling the tree in rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { createSidebarDriveNode } from "./sidebarDriveNode.js";

export default function createSidebar({ os, onNavigate }) {
	const sidebar = createElement({
		tag: "div",
		attributes: {
			class: "file-explorer-sidebar",
			"aria-label": "Explorer locations"
		}
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
		root.replaceChildren(...driveNodes({
			os,
			onNavigate,
			onMounted: rebuild
		}));
	}

	function syncSelection(path) {
		sidebar.querySelectorAll(".tree-node-content.selected").forEach(element => {
			element.classList.remove("selected");
		});
		const selector = `[data-full-path="${css(path)}"] .tree-node-content`;
		sidebar.querySelector(selector)?.classList.add("selected");
	}

	rebuild();
	return {
		dom: sidebar,
		syncSelection,
		rebuild
	};
}

function driveNodes(options) {
	const mounts = options.os?.vfs?.mounts?.() || [];
	const mountedPaths = new Set(mounts.map(mount => mount.prefix));
	const records = [
		...mounts,
		...(options.os?.drives?.list?.() || [])
			.filter(drive => !mountedPaths.has(drive.root))
			.map(drive => ({ ...drive, prefix: drive.root }))
	];
	return records.map(mount => createSidebarDriveNode({
		...options,
		mount
	}));
}

function css(value) {
	if (globalThis.CSS?.escape) {
		return globalThis.CSS.escape(String(value || ""));
	}
	return String(value || "").replace(/["\\]/g, character => `\\${character}`);
}
