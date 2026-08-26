//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteBrowserSurface
 * @description
 * The Awtsmoos places each host control in the vessel matching its purpose.
 * Awtsmoos.com keeps navigation beside the trusted omnibox while session machinery
 * rests in Advanced; common motion stays near, deeper identity state stays clear,
 * and no guest page can counterfeit the chrome through which the user chooses to steer.
 */

import {
	createRemoteAction,
	createRemoteElement,
	createRemoteInput,
	requireRemoteMount
} from "./remoteSurfaceElements.js";

/**
 * Mounts navigation and session controls into trusted browser regions.
 *
 * @param {Object} browserSurface
 * 	The composed browser surface exposing navigationActions, sessionPanel, and address.
 * @param {Document} documentObject
 * 	The trusted host document used to create controls.
 * @returns {Object}
 * 	The stable remote-control contract consumed by navigation orchestration.
 */
export function createRemoteBrowserSurface(browserSurface, documentObject = document) {
	const navigationActions = requireRemoteMount(
		browserSurface.navigationActions,
		"BROWSER_NAVIGATION_ACTIONS_NOT_FOUND"
	);
	const sessionPanel = requireRemoteMount(
		browserSurface.sessionPanel,
		"BROWSER_SESSION_PANEL_NOT_FOUND"
	);

	const back = createRemoteAction(documentObject, "←", "Back", "back");
	const forward = createRemoteAction(documentObject, "→", "Forward", "forward");
	const reload = createRemoteAction(documentObject, "↻", "Reload", "reload");
	const go = createRemoteAction(documentObject, "Go", "Open address", "go");
	navigationActions.append(back, forward, reload, go);

	const sessionRow = createRemoteElement(
		documentObject,
		"div",
		"awtsmoos-browser-remote-session"
	);
	const alias = createRemoteInput(documentObject, "Alias", "Alias ID");
	const jar = createRemoteInput(documentObject, "Jar", "Cookie jar ID");
	jar.value = "default";
	const clearJar = createRemoteAction(
		documentObject,
		"Clear jar",
		"Clear remote cookie jar",
		"clear-jar"
	);
	const status = createRemoteElement(
		documentObject,
		"div",
		"awtsmoos-browser-remote-status",
		"Session idle · alias required"
	);
	sessionRow.append(alias, jar, clearJar);
	sessionPanel.append(sessionRow, status);

	return {
		address: browserSurface.address,
		alias,
		back,
		clearJar,
		forward,
		go,
		jar,
		reload,
		row: sessionRow,
		status
	};
}
