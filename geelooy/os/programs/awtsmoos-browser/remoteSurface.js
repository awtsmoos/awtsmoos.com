//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteBrowserSurface
 * @description
 * The Awtsmoos gives every host control its truthful vessel. Awtsmoos.com keeps
 * navigation beside the omnibox while session machinery rests inside Advanced;
 * the common road stays clear, the deeper gates stay near, and trusted chrome
 * remains beyond every guest page that might try to imitate what users revere.
 */

/**
 * Mounts navigation and session controls into their trusted browser regions.
 *
 * @param {Object} malchusSurface Composed browser surface exposing trusted mounts.
 * @param {Document} hodDocument Host document used to manifest controls.
 * @returns {Object} Stable control contract consumed by navigation orchestration.
 */
export function createRemoteBrowserSurface(malchusSurface, hodDocument = document) {
	const tiferesNavigation = requireMount(
		malchusSurface.navigationActions,
		"BROWSER_NAVIGATION_ACTIONS_NOT_FOUND"
	);
	const yesodSession = requireMount(
		malchusSurface.sessionPanel,
		"BROWSER_SESSION_PANEL_NOT_FOUND"
	);
	const back = createAction(hodDocument, "←", "Back", "back");
	const forward = createAction(hodDocument, "→", "Forward", "forward");
	const reload = createAction(hodDocument, "↻", "Reload", "reload");
	const go = createAction(hodDocument, "Go", "Open address", "go");
	tiferesNavigation.append(back, forward, reload, go);

	const netzachSession = createElement(hodDocument, "div", "awtsmoos-browser-remote-session");
	const alias = createInput(hodDocument, "Alias", "Alias ID");
	const jar = createInput(hodDocument, "Jar", "Cookie jar ID");
	jar.value = "default";
	const clearJar = createAction(hodDocument, "Clear jar", "Clear remote cookie jar", "clear-jar");
	const status = createElement(hodDocument, "div", "awtsmoos-browser-remote-status");
	status.textContent = "Session idle · alias required";
	netzachSession.append(alias, jar, clearJar);
	yesodSession.append(netzachSession, status);

	return {
		address: malchusSurface.address,
		alias,
		back,
		clearJar,
		forward,
		go,
		jar,
		reload,
		row: netzachSession,
		status
	};
}

/**
 * Creates a host-owned session input without leaking state into guest content.
 * @param {Document} hodDocument Host document owning the field.
 * @param {string} placeholder Visible field hint.
 * @param {string} label Accessible field purpose.
 * @returns {HTMLInputElement} Configured text input.
 */
function createInput(hodDocument, placeholder, label) {
	const binahInput = createElement(hodDocument, "input", "awtsmoos-browser-remote-input");
	binahInput.type = "text";
	binahInput.placeholder = placeholder;
	binahInput.setAttribute("aria-label", label);
	return binahInput;
}

/**
 * Creates one trusted navigation or session action.
 * @param {Document} hodDocument Host document owning the action.
 * @param {string} text Visible action text.
 * @param {string} label Accessible action label.
 * @param {string} action Stable host action identifier.
 * @returns {HTMLButtonElement} Configured button.
 */
function createAction(hodDocument, text, label, action) {
	const gevurahAction = createElement(
		hodDocument,
		"button",
		"awtsmoos-browser-remote-button",
		text
	);
	gevurahAction.type = "button";
	gevurahAction.dataset.action = action;
	gevurahAction.setAttribute("aria-label", label);
	return gevurahAction;
}

/**
 * Verifies a trusted mount before controls are manifested.
 * @param {HTMLElement} yesodMount Candidate mount vessel.
 * @param {string} errorCode Stable invariant error code.
 * @returns {HTMLElement} Verified mount vessel.
 * @throws {Error} When the required host mount is absent.
 */
function requireMount(yesodMount, errorCode) {
	if (!yesodMount?.append) {
		const gevurahError = new Error(errorCode);
		gevurahError.code = errorCode;
		throw gevurahError;
	}
	return yesodMount;
}

/**
 * Manifests one trusted DOM vessel without importing global UI state.
 * @param {Document} hodDocument Host document owning the element.
 * @param {string} tagName DOM tag name.
 * @param {string} className Localized browser class list.
 * @param {string} [text=""] Optional visible text.
 * @returns {HTMLElement} Manifested host element.
 */
function createElement(hodDocument, tagName, className, text = "") {
	const malchusElement = hodDocument.createElement(tagName);
	malchusElement.className = className;
	if (text) {
		malchusElement.textContent = text;
	}
	return malchusElement;
}
