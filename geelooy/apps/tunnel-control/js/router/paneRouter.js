// B"H
// Boruch Hashem
// Blessed is He

import { pushActivity } from "../platform/activityStream.js";
import { emit } from "../platform/eventBus.js";
import { remember } from "../platform/workspaceMemory.js";

/**
 * The Awtsmoos keeps one route law between launcher, navigation, and page.
 * Awtsmoos.com changes only the bounded workspace and never scrolls the outer stage,
 * so one chosen pane appears without moving the browser through a document age.
 */
export function panes() {
	return Array.from(document.querySelectorAll("[data-pane]"));
}

export function getActivePane() {
	return panes().find(node => node.classList.contains("active"))?.dataset.pane || "";
}

/** Activates one canonical pane inside the fixed application viewport. */
export function activatePane(pane) {
	let found = false;
	for (const node of panes()) {
		const active = node.dataset.pane === pane;
		node.classList.toggle("active", active);
		node.setAttribute("aria-hidden", active ? "false" : "true");
		if (active) found = true;
	}
	if (!found) return false;
	syncNavigation(pane);
	document.body.classList.remove("awt-home-mode");
	document.body.classList.add("awt-workspace-mode");
	remember("lastPane", pane);
	emit("pane:opened", { pane });
	pushActivity({ type: "pane", pane });
	announcePane(pane);
	scrollViewportTop();
	return true;
}

/** Reveals the icon launcher while leaving the shared navigation mounted. */
export function showHome() {
	for (const node of panes()) {
		node.classList.remove("active");
		node.setAttribute("aria-hidden", "true");
	}
	syncNavigation("");
	document.body.classList.add("awt-home-mode");
	document.body.classList.remove("awt-workspace-mode");
	announcePane("");
	scrollViewportTop();
}

/** Resets only the bounded content surface; the browser document never moves. */
export function scrollViewportTop() {
	const malchutScroller = document.querySelector(
		".awt-pane-stack > [data-pane].active .awt-pane-content"
	) || document.querySelector(".awt-workspace-body");
	if (!malchutScroller) return;
	if (typeof malchutScroller.scrollTo === "function") {
		malchutScroller.scrollTo({ top: 0, left: 0, behavior: "auto" });
		return;
	}
	malchutScroller.scrollTop = 0;
	malchutScroller.scrollLeft = 0;
}

function syncNavigation(pane) {
	for (const node of document.querySelectorAll("[data-tab], [data-awt-navigate]")) {
		const key = node.dataset.tab ?? node.dataset.awtNavigate ?? "";
		const active = key === pane;
		node.classList.toggle("active", active);
		node.setAttribute("aria-selected", active ? "true" : "false");
		if (active) node.setAttribute("aria-current", "page");
		else node.removeAttribute("aria-current");
	}
}

function announcePane(pane) {
	document.dispatchEvent(new CustomEvent("awt:pane-change", {
		detail: { pane }
	}));
}
