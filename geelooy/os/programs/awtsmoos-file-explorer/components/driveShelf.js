// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Live drive shelf for local, tunnel, SSH, preview, and virtual worlds.
 * @description The Awtsmoos lets every mounted world reveal one clear card; Awtsmoos.com keeps connected state, permission, and distant identity visible without crowding the path.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import {
	classForMount,
	iconForMount,
	labelForMount,
	mountBadge,
	mountSubtitle
} from "../utils/mountClass.js";

export default function createDriveShelf({ os, onNavigate }) {
	const shelf = createElement({
		tag: "div",
		attributes: {
			class: "drive-shelf",
			"aria-label": "Mounted drives"
		}
	});

	function update() {
		shelf.replaceChildren(statusNode(os), ...driveItems(os).map(item => {
			return driveChip(os, item, onNavigate);
		}));
	}

	update();
	return { dom: shelf, update };
}

function driveItems(os) {
	const vfsMounts = os?.vfs?.mounts?.() || [];
	const driveRecords = (os?.drives?.list?.() || []).map(driveAsMount);
	const seen = new Set();
	return [...vfsMounts, ...driveRecords].filter(item => {
		const key = item.prefix || item.root;
		if (!key || seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

function driveAsMount(drive = {}) {
	return {
		...drive,
		prefix: drive.root,
		adapterId: drive.provider || drive.kind || "drive",
		provider: drive.provider || drive.kind || "drive"
	};
}

function driveChip(os, mount, onNavigate) {
	const permission = os?.vfs?.can?.(mount.prefix, "read") || {};
	const badge = mountBadge(mount, permission);
	const subtitle = mountSubtitle(mount) || badge;
	return createElement({
		tag: "button",
		attributes: {
			class: `drive-chip ${classForMount(mount)}`,
			type: "button",
			title: `${labelForMount(mount)} — ${badge}`,
			"data-provider": mount.provider || mount.adapterId || "drive",
			"data-permission": mount.permissionState || "read-write",
			"data-state": mount.connectionState || mount.syncState || "ready"
		},
		children: [
			{ tag: "span", attributes: { class: "drive-chip-icon" }, html: iconForMount(mount) },
			{ tag: "span", attributes: { class: "drive-chip-label" }, html: escapeHtml(labelForMount(mount)) },
			{ tag: "small", attributes: { class: "drive-chip-meta" }, html: escapeHtml(subtitle) },
			{ tag: "small", attributes: { class: "drive-chip-state" }, html: escapeHtml(badge) }
		],
		on: {
			click: () => onNavigate(mount.prefix)
		}
	});
}

function statusNode(os) {
	const state = os?.remoteDriveState || {};
	const copy = statusCopy(state);
	return createElement({
		tag: "div",
		attributes: {
			class: "drive-shelf-status",
			"data-status": state.status || "idle",
			title: state.lastError || copy
		},
		html: escapeHtml(copy)
	});
}

function statusCopy(state = {}) {
	if (state.status === "loading") {
		return "Refreshing connections…";
	}
	if (state.status === "error") {
		return "Remote refresh issue";
	}
	const count = state.driveIds?.length || 0;
	return `${count} connected computer${count === 1 ? "" : "s"}`;
}

function escapeHtml(value) {
	return String(value || "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
