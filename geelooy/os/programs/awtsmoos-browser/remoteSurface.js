//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteBrowserSurface
 * @description
 * The Awtsmoos gives remote navigation a visible host-owned control strip.
 * Awtsmoos.com keeps alias authority, cookie-jar identity, navigation, and peruta
 * testimony outside guest markup so remote pages can never counterfeit these controls.
 */

export function createRemoteBrowserSurface(browserSurface, documentObject = document) {
	const toolbar = browserSurface.root.querySelector(".awtsmoos-browser-toolbar");
	if (!toolbar) throw surfaceError("BROWSER_TOOLBAR_NOT_FOUND");
	const row = element(documentObject, "div", "awtsmoos-browser-remote");
	const alias = input(documentObject, "awtsmoos-browser-remote-input", "Alias", "Alias ID");
	const jar = input(documentObject, "awtsmoos-browser-remote-input", "Jar", "Cookie jar ID");
	jar.value = "default";
	const back = button(documentObject, "←", "Back");
	const forward = button(documentObject, "→", "Forward");
	const reload = button(documentObject, "↻", "Reload");
	const go = button(documentObject, "Go", "Fetch remote page");
	const clearJar = button(documentObject, "Clear jar", "Clear remote cookie jar");
	const status = element(documentObject, "div", "awtsmoos-browser-remote-status");
	status.textContent = "Remote mode idle · alias required";
	row.append(alias, jar, back, forward, reload, go, clearJar, status);
	toolbar.append(row);
	return {
		alias,
		back,
		clearJar,
		forward,
		go,
		jar,
		reload,
		row,
		status
	};
}

function input(documentObject, className, placeholder, label) {
	const value = element(documentObject, "input", className);
	value.type = "text";
	value.placeholder = placeholder;
	value.setAttribute("aria-label", label);
	return value;
}

function button(documentObject, text, label) {
	const value = element(documentObject, "button", "awtsmoos-browser-remote-button", text);
	value.type = "button";
	value.setAttribute("aria-label", label);
	return value;
}

function element(documentObject, tagName, className) {
	const value = documentObject.createElement(tagName);
	value.className = className;
	return value;
}

function surfaceError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
