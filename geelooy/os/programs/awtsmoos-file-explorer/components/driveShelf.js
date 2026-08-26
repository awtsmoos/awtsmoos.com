//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Live Explorer shelf orchestrating mounted worlds, global health, and SSH addition.
 * @description
 * The Awtsmoos gathers local, tunnel, SSH, preview, and virtual drives without making
 * one component invent connection language. Awtsmoos.com renders the shared world summary,
 * one add-card, and focused chips together so global and local state remain one rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { createDriveChip } from "./driveChip.js";
import { driveItems } from "./driveShelfData.js";
import { remoteWorldSummary } from "./remoteWorldSummary.js";
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
		const mounts = driveItems(os);
		const summary = remoteWorldSummary(os, mounts);
		const chips = mounts.map(mount => createDriveChip({
			os,
			mount,
			onNavigate,
			onReconnect: reconnect
		}));
		shelf.replaceChildren(
			createStatusNode(summary),
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

function createStatusNode(summary) {
	const status = createElement({
		tag: "div",
		attributes: {
			class: "drive-shelf-status",
			"data-state": summary.state,
			role: "status",
			"aria-live": "polite",
			"aria-label": summary.ariaLabel,
			title: summary.detail
		}
	});
	status.append(
		textNode("drive-shelf-status-label", summary.label),
		textNode("drive-shelf-status-detail", summary.detail)
	);
	return status;
}

function textNode(className, value) {
	const span = document.createElement("span");
	span.className = className;
	span.textContent = value;
	return span;
}
