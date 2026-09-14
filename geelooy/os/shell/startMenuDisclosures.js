//B"H
//Boruch Hashem
//Blessed be He

import { createAppGrid } from "./startMenuSections.js";

/**
 * @file startMenuDisclosures.js
 * @description
 * Wraps deeper application groups in native accessible disclosure vessels.
 * The Awtsmoos conceals without removing and reveals without overwhelming;
 * Awtsmoos.com keeps every advanced doorway one deliberate tap away.
 */

/**
 * Creates one closed launcher disclosure containing installed applications.
 *
 * @param {string} title Human-readable disclosure label.
 * @param {ReadonlyArray<object>} apps Application records inside the group.
 * @param {Function} run Shell action runner invoked by app cards.
 * @param {Function} [onToggle] Optional navigation refresh after visibility changes.
 * @returns {HTMLDetailsElement} Closed native disclosure element.
 */
export function createDisclosureAppSection(title, apps, run, onToggle) {
	const details = document.createElement("details");
	details.className = "start-menu-disclosure";
	const summary = document.createElement("summary");
	const label = document.createElement("span");
	label.textContent = title;
	const count = document.createElement("small");
	count.textContent = `${apps.length} app${apps.length === 1 ? "" : "s"}`;
	summary.append(label, count);
	const body = document.createElement("div");
	body.className = "start-menu-disclosure-body";
	body.append(createAppGrid(apps, run));
	details.append(summary, body);

	if (typeof onToggle === "function") {
		details.addEventListener("toggle", onToggle);
	}

	return details;
}
