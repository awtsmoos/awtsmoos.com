//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserShliachControl
 * @description
 * Opens the canonical Awtsmoos Shliach inside Geelooy Browser's real Chromium
 * session. The host creates bounded prompt context; provider login remains a
 * user-controlled browser action and no cookie, password, or token is extracted.
 */

import { buildShliachUrl } from "/shared/shliach/ShliachUrl.js";

/**
 * Installs the trusted Shliach toolbar action.
 * @param {object} options Browser surface, navigation authority, and launch context.
 * @returns {Function} Listener disposer.
 */
export function installBrowserShliachControl(options = {}) {
	const button = options.browserSurface?.shliachButton;
	if (!button) {
		return () => {};
	}
	const open = async () => {
		const target = buildShliachUrl(shliachContext(options));
		options.browserSurface.address.value = target.url;
		await options.navigation.navigate(target.url, { engineMode: "compatibility" });
	};
	const click = () => open().catch(error => {
		options.report?.(
			error?.message
			|| error?.code
			|| "Awtsmoos Shliach could not open."
		);
	});
	button.addEventListener("click", click);
	return () => button.removeEventListener("click", click);
}

/** Builds only safe path/project/user-goal context for the Shliach deep link. */
function shliachContext(options) {
	const requested = options.programOptions?.shliachContext || {};
	return {
		entries: requested.entries,
		goal: requested.goal || browserGoal(),
		path: requested.path || options.path || "awtsmoos://browser",
		projectId: requested.projectId || options.programOptions?.projectId || "current project",
		surface: "Geelooy OS Browser"
	};
}

/** Returns the default browser-to-Shliach request shown to the user in ChatGPT. */
function browserGoal() {
	return [
		"The user opened Awtsmoos Shliach from the built-in Geelooy Browser.",
		"Help them create, inspect, debug, or operate their Awtsmoos project from this browser context.",
		"Use authorized Awtsmoos account capabilities and preview-first publication safeguards."
	].join(" ");
}
