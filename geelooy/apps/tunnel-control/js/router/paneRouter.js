// B"H

import { emit } from "../platform/eventBus.js";
import { remember } from "../platform/workspaceMemory.js";
import { pushActivity } from "../platform/activityStream.js";

export function panes() {
	return Array.from(document.querySelectorAll("[data-pane]"));
}

export function getActivePane() {
	return panes().find(pane => pane.classList.contains("active"))?.dataset.pane || "";
}

function syncNav(pane) {
	for (const node of document.querySelectorAll("[data-tab], [data-awt-navigate]")) {
		const key = node.dataset.tab || node.dataset.awtNavigate;
		const active = key === pane;
		node.classList.toggle("active", active);
		node.setAttribute("aria-selected", active ? "true" : "false");
	}
}

function announcePane(pane) {
	document.dispatchEvent(new CustomEvent("awt:pane-change", {
		detail: { pane }
	}));
}

/**
 * B"H — Pane changes are lifecycle events. Feature vessels may acquire timers,
 * sockets, or observers only while their pane is named active.
 */
export function activatePane(pane) {
	let found = false;
	for (const node of panes()) {
		const active = node.dataset.pane === pane;
		node.classList.toggle("active", active);
		if (active) found = true;
	}
	if (!found) return;
	syncNav(pane);
	document.body.classList.remove("awt-home-mode");
	document.body.classList.add("awt-workspace-mode");
	remember("lastPane", pane);
	emit("pane:opened", { pane });
	pushActivity({ type: "pane", pane });
	announcePane(pane);
}

export function showHome() {
	for (const node of panes()) node.classList.remove("active");
	syncNav("");
	document.body.classList.add("awt-home-mode");
	document.body.classList.remove("awt-workspace-mode");
	announcePane("");
}
