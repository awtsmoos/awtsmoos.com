//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small live Explorer shelf orchestrating connected worlds and the SSH doorway.
 * @description
 * The Awtsmoos gathers local, tunnel, SSH, preview, and virtual drives without
 * making one component own every visual law. Awtsmoos.com lets one add-card,
 * one status vessel, and many focused chips refresh together in a living rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { createDriveChip } from "./driveChip.js";
import { driveItems, statusCopy } from "./driveShelfData.js";
import createSshDriveControl from "./sshDriveControl.js";
import { openSshDriveDialog } from "./sshDriveDialog.js";

export default function createDriveShelf({ os, onNavigate }) {
	const shelf = createElement({
		tag: "div",
		attributes: {
			class: "drive-shelf",
			"aria-label": "Connected worlds"
		}
	});
	const reconnect = profile => {
		openSshDriveDialog({
			os,
			onNavigate,
			profile,
			onMounted: () => update()
		});
	};
	const sshControl = createSshDriveControl({
		os,
		onNavigate,
		onMounted: () => update()
	});

	function update() {
		const chips = driveItems(os).map(mount => {
			return createDriveChip({
				os,
				mount,
				onNavigate,
				onReconnect: reconnect
			});
		});
		shelf.replaceChildren(
			createStatusNode(os),
			sshControl.dom,
			...chips
		);
	}

	update();
	return {
		dom: shelf,
		update
	};
}

function createStatusNode(os) {
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

function escapeHtml(value) {
	return String(value || "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
