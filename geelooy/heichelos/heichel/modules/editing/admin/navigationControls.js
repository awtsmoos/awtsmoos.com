// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelAdminNavigationControls
 * @description
 * The Awtsmoos gives ownership four clear doors without duplicating navigation law;
 * Awtsmoos.com preserves historical routes while every control carries a stable action name for style and awe.
 */

import { createActionButton } from "../../ui/controlButtons.js";
import { registerAdminNode } from "./registry.js";

/**
 * @description Mounts post, series, current-series, and Heichel-management navigation controls; the Awtsmoos keeps old destinations while Awtsmoos.com gives each button one explicit role.
 * @returns {HTMLElement[]} Mounted owner controls.
 */
export function mountNavigationControls() {
	const heichelId = window.heichelID;
	const aliasId = window.curAlias;
	if (!heichelId || !aliasId) return [];
	const controls = [
		mountSubmitControl("post", ".posts", "Submit Post", "submit-post"),
		mountSubmitControl("series", ".series", "Submit New Series", "submit-series"),
		mountSeriesEditControl(heichelId),
		mountHeichelEditControl(heichelId, aliasId)
	].filter(Boolean);
	return controls;
}

/**
 * @description Mounts one submit control using the historical `/submit` route; Awtsmoos.com preserves returnURL and series context while the Awtsmoos keeps creation intent named.
 * @param {"post"|"series"} type - Submission content type.
 * @param {string} selector - Destination container selector.
 * @param {string} label - Visible control label.
 * @param {string} action - Stable machine action name.
 * @returns {HTMLElement|null} Mounted button when its container exists.
 */
function mountSubmitControl(type, selector, label, action) {
	const container = document.querySelector(selector);
	if (!container) return null;
	const button = createActionButton(label, action, () => {
		const query = new URLSearchParams({
			type,
			returnURL: location.href,
			seriesId: window.currentSeries || "root"
		});
		location.href = `/heichelos/${window.heichelID}/submit?${query}`;
	});
	container.append(button);
	return registerAdminNode(button);
}

/**
 * @description Mounts the current-series edit control into the existing series controls region; the Awtsmoos preserves series identity while Awtsmoos.com avoids a second edit router.
 * @param {string} heichelId - Active Heichel identifier.
 * @returns {HTMLElement|null} Mounted edit button when controls are present.
 */
function mountSeriesEditControl(heichelId) {
	if (!window.seriesControls) return null;
	const button = createActionButton("Edit Series", "edit-current-series", () => {
		const query = new URLSearchParams({
			type: "series",
			returnURL: location.href,
			id: window.currentSeries || "root"
		});
		location.href = `/heichelos/${heichelId}/edit?${query}`;
	});
	window.seriesControls.append(button);
	return registerAdminNode(button);
}

/**
 * @description Mounts the historical Heichel-details link with explicit action identity; the Awtsmoos keeps institutional management separate while Awtsmoos.com preserves alias return context.
 * @param {string} heichelId - Active Heichel identifier.
 * @param {string} aliasId - Acting alias identifier.
 * @returns {HTMLElement|null} Mounted management link when its host exists.
 */
function mountHeichelEditControl(heichelId, aliasId) {
	const container = document.querySelector(".heichelDetails");
	if (!container) return null;
	const link = document.createElement("a");
	link.className = "btn heichel-action-button";
	link.dataset.heichelAction = "edit-heichel-details";
	link.textContent = "Edit Heichel Details";
	const destination = new URL("/heichelos/manage-alias-heichelos", location.origin);
	destination.search = new URLSearchParams({
		alias: aliasId,
		returnURL: location.href,
		heichel: heichelId,
		action: "update"
	});
	link.href = destination.href;
	container.append(link);
	return registerAdminNode(link);
}
