//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteSurfaceElements
 * @description
 * The Awtsmoos gives each trusted control a measured vessel before it enters the shell.
 * Awtsmoos.com centralizes low-level DOM creation here so remote-session composition stays
 * small, readable, and honest: Gevurah defines the bounds, while Malchus receives the form.
 */

/**
 * Creates a trusted navigation or session action button.
 *
 * @param {Document} documentObject Host document owning the button.
 * @param {string} text Visible button text.
 * @param {string} label Accessible action label.
 * @param {string} action Stable host action identifier.
 * @returns {HTMLButtonElement} Configured button.
 */
export function createRemoteAction(documentObject, text, label, action) {
	const button = createRemoteElement(
		documentObject,
		"button",
		"awtsmoos-browser-remote-button",
		text
	);
	button.type = "button";
	button.dataset.action = action;
	button.setAttribute("aria-label", label);
	return button;
}

/**
 * Creates one trusted host-session text field.
 *
 * @param {Document} documentObject Host document owning the field.
 * @param {string} placeholder Visible field hint.
 * @param {string} label Accessible field purpose.
 * @returns {HTMLInputElement} Configured text input.
 */
export function createRemoteInput(documentObject, placeholder, label) {
	const input = createRemoteElement(
		documentObject,
		"input",
		"awtsmoos-browser-remote-input"
	);
	input.type = "text";
	input.placeholder = placeholder;
	input.setAttribute("aria-label", label);
	return input;
}

/**
 * Requires a trusted host mount before controls may be manifested.
 *
 * @param {HTMLElement} mount Candidate mount vessel.
 * @param {string} errorCode Stable invariant error code.
 * @returns {HTMLElement} Verified mount element.
 * @throws {Error} When the required host mount is absent.
 */
export function requireRemoteMount(mount, errorCode) {
	if (!mount?.append) {
		const error = new Error(errorCode);
		error.code = errorCode;
		throw error;
	}
	return mount;
}

/**
 * Creates one host-owned DOM element with optional visible text.
 *
 * @param {Document} documentObject Host document owning the element.
 * @param {string} tagName DOM tag name.
 * @param {string} className Localized browser class list.
 * @param {string} [text=""] Optional visible text.
 * @returns {HTMLElement} The created element.
 */
export function createRemoteElement(documentObject, tagName, className, text = "") {
	const element = documentObject.createElement(tagName);
	element.className = className;
	if (text) {
		element.textContent = text;
	}
	return element;
}
