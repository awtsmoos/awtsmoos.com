//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserDeveloperTools
 * @description
 * The Awtsmoos lets hidden machinery remain available without ruling the visible day.
 * Awtsmoos.com gathers Merkava controls and diagnostics into one developer vessel,
 * where Chochmah may explore and Binah may explain; the ordinary browser stays clear,
 * while deeper instruments wait with patient light for the hand that draws them near.
 */

/**
 * Creates the preserved Merkava developer controls and diagnostics sections.
 *
 * @param {Document} documentObject
 * 	The trusted host document that owns developer controls.
 * @returns {Object}
 * 	Developer and diagnostics sections plus editor, buttons, depth input, and metrics.
 */
export function createBrowserDeveloperTools(documentObject = document) {
	const developerSection = createSection(documentObject, "Merkava developer tools");
	const controls = createElement(documentObject, "div", "awtsmoos-browser-developer-controls");
	const renderButton = createButton(documentObject, "Render developer view", "Render");
	const selfHostButton = createButton(documentObject, "Self-host developer runtime", "Self-host");
	const depth = createElement(documentObject, "input", "awtsmoos-browser-depth");
	depth.type = "number";
	depth.min = "0";
	depth.max = "4";
	depth.value = "2";
	depth.setAttribute("aria-label", "Self-host depth");
	controls.append(renderButton, selfHostButton, depth);

	const editor = createElement(documentObject, "textarea", "awtsmoos-browser-editor");
	editor.spellcheck = false;
	editor.setAttribute("aria-label", "Merkava markup editor");
	developerSection.body.append(controls, editor);

	const diagnosticsSection = createSection(documentObject, "Diagnostics");
	const metrics = createElement(documentObject, "pre", "awtsmoos-browser-metrics", "Ready");
	diagnosticsSection.body.append(metrics);

	return {
		depth,
		developerSection: developerSection.section,
		diagnosticsSection: diagnosticsSection.section,
		editor,
		metrics,
		renderButton,
		selfHostButton
	};
}

/**
 * Creates one labeled advanced-drawer section with a body vessel.
 *
 * @param {Document} documentObject Host document receiving the section.
 * @param {string} label Visible section title.
 * @returns {{section: HTMLElement, body: HTMLElement}} Section and content body.
 */
function createSection(documentObject, label) {
	const section = createElement(documentObject, "section", "awtsmoos-browser-advanced-section");
	const heading = createElement(documentObject, "h3", "awtsmoos-browser-section-title", label);
	const body = createElement(documentObject, "div", "awtsmoos-browser-section-body");
	section.append(heading, body);
	return { section, body };
}

/**
 * Creates one trusted developer-tool button.
 *
 * @param {Document} documentObject Host document owning the button.
 * @param {string} label Accessible button label.
 * @param {string} text Visible button text.
 * @returns {HTMLButtonElement} The configured button.
 */
function createButton(documentObject, label, text) {
	const button = createElement(documentObject, "button", "awtsmoos-browser-tool-button", text);
	button.type = "button";
	button.setAttribute("aria-label", label);
	return button;
}

/**
 * Creates one host-owned DOM element with optional text.
 *
 * @param {Document} documentObject Host document that owns the element.
 * @param {string} tagName DOM tag name.
 * @param {string} className CSS class list.
 * @param {string} [text=""] Optional visible text.
 * @returns {HTMLElement} The created element.
 */
function createElement(documentObject, tagName, className, text = "") {
	const element = documentObject.createElement(tagName);
	element.className = className;
	if (text) {
		element.textContent = text;
	}
	return element;
}
