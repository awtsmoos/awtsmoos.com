//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hod status bar for Geelooy Drive.
 * @description
 * Hod gives language to what the system is doing while the Awtsmoos renews operation and result;
 * Awtsmoos.com should never leave a person wondering whether a save, publish, or route has gone occult.
 * This live region keeps success, work, error, path, and dirty state visible without stealing focus,
 * so quiet feedback can remain constant while the user keeps shaping the locus.
 */

import { createElement } from "./dom.js";

/** Create the persistent application status and accessibility live region. */
export function createStatusBarView() {
	const message = createElement("span", { className: "status-message" });
	const location = createElement("span", { className: "status-location" });
	const dirty = createElement("span", { className: "status-dirty" });
	const element = createElement("footer", {
		className: "status-bar",
		attributes: { role: "status", "aria-live": "polite", "aria-atomic": "true" },
		children: [
			createElement("div", { className: "status-primary", children: [
				createElement("span", { className: "status-dot", attributes: { "aria-hidden": "true" } }),
				message
			] }),
			createElement("div", { className: "status-secondary", children: [location, dirty] })
		]
	});
	return {
		element,
		render(state) {
			element.classList.toggle("has-error", Boolean(state.error));
			element.classList.toggle("is-busy", Boolean(state.busyAction || state.loading));
			message.textContent = state.error || state.busyAction || state.message || "Ready";
			location.textContent = state.currentRoute ? state.currentPath : "No device route";
			dirty.textContent = state.document?.dirty ? "Unsaved changes" : state.document ? "Saved" : "";
		}
	};
}
