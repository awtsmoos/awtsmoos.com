//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserAdvancedPanel
 * @description
 * The Awtsmoos conceals nothing, yet wisdom appears in the right vessel and hour.
 * Awtsmoos.com keeps session testimony and developer instruments inside one drawer,
 * where Gevurah gives boundary and Tiferes keeps the ordinary browser clear;
 * advanced light remains available, but never crowds the path the user holds most dear.
 */

import { createBrowserDeveloperTools } from "./browserDeveloperTools.js";

/**
 * Creates the advanced browser drawer and its session/developer regions.
 *
 * @param {Document} documentObject
 * 	The trusted host document that owns the advanced browser controls.
 * @returns {Object}
 * 	Drawer element, session slot, preserved developer handles, and visibility setter.
 */
export function createBrowserAdvancedPanel(documentObject = document) {
	const advancedPanel = createElement(documentObject, "aside", "awtsmoos-browser-advanced-panel");
	advancedPanel.hidden = true;
	advancedPanel.setAttribute("aria-hidden", "true");

	const header = createHeader(documentObject);
	const session = createSessionSection(documentObject);
	const developer = createBrowserDeveloperTools(documentObject);
	advancedPanel.append(
		header,
		session.section,
		developer.developerSection,
		developer.diagnosticsSection
	);

	/**
	 * Sets the host-owned drawer visibility and accessibility testimony.
	 *
	 * @param {boolean} open Whether the advanced drawer should be visible.
	 * @returns {boolean} The normalized open state.
	 */
	function setAdvancedOpen(open) {
		const normalized = open === true;
		advancedPanel.hidden = !normalized;
		advancedPanel.classList.toggle("is-open", normalized);
		advancedPanel.setAttribute("aria-hidden", String(!normalized));
		return normalized;
	}

	return {
		advancedPanel,
		depth: developer.depth,
		editor: developer.editor,
		metrics: developer.metrics,
		renderButton: developer.renderButton,
		selfHostButton: developer.selfHostButton,
		sessionPanel: session.body,
		setAdvancedOpen
	};
}

/**
 * Creates the drawer heading that explains its secondary role.
 *
 * @param {Document} documentObject Host document receiving the heading.
 * @returns {HTMLElement} Complete advanced-panel header.
 */
function createHeader(documentObject) {
	const header = createElement(documentObject, "header", "awtsmoos-browser-advanced-header");
	const title = createElement(documentObject, "h2", "awtsmoos-browser-advanced-title", "Advanced");
	const subtitle = createElement(
		documentObject,
		"p",
		"awtsmoos-browser-advanced-subtitle",
		"Session controls and developer renderer"
	);
	header.append(title, subtitle);
	return header;
}

/**
 * Creates the dedicated host-session slot consumed by remote controls.
 *
 * @param {Document} documentObject Host document receiving the session region.
 * @returns {{section: HTMLElement, body: HTMLElement}} Session section and mount body.
 */
function createSessionSection(documentObject) {
	const section = createElement(documentObject, "section", "awtsmoos-browser-advanced-section");
	const title = createElement(documentObject, "h3", "awtsmoos-browser-section-title", "Session");
	const body = createElement(documentObject, "div", "awtsmoos-browser-session-panel");
	section.append(title, body);
	return { section, body };
}

/**
 * Creates a host-owned DOM element with optional visible text.
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
