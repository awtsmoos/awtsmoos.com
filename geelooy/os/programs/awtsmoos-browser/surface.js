//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserSurface
 * @description
 * The Awtsmoos joins trusted chrome, living viewport, and hidden instruments into one
 * browser vessel. Awtsmoos.com keeps the guest world beneath host-owned navigation,
 * while Tiferes harmonizes old Merkava tools with a new local-browser manifestation:
 * the page receives the center, the controls receive their place, and neither trades truth.
 */

import { createBrowserAdvancedPanel } from "./browserAdvancedPanel.js?compact=true";
import { createBrowserChrome } from "./browserChrome.js?compact=true";
import { createBrowserViewport } from "./browserViewport.js?compact=true";

/**
 * Composes the complete Awtsmoos Browser application surface.
 *
 * @param {Document} documentObject
 * 	The trusted host document used to create all application chrome and containers.
 * @returns {Object}
 * 	Legacy runtime handles plus new browser chrome, viewport, and advanced-drawer handles.
 */
export function createBrowserSurface(documentObject = document) {
	const root = createElement(documentObject, "section", "awtsmoos-browser-host");
	const chrome = createBrowserChrome(documentObject);
	const viewport = createBrowserViewport(documentObject);
	const advanced = createBrowserAdvancedPanel(documentObject);
	const body = createElement(documentObject, "div", "awtsmoos-browser-body");
	const boundary = createBoundary(documentObject);

	advanced.advancedPanel.append(boundary);
	body.append(viewport.viewport, advanced.advancedPanel);
	root.append(chrome.toolbar, body);

	let advancedOpen = false;
	chrome.advancedToggle.setAttribute("aria-expanded", "false");
	chrome.advancedToggle.addEventListener("click", () => {
		advancedOpen = advanced.setAdvancedOpen(!advancedOpen);
		chrome.advancedToggle.setAttribute("aria-expanded", String(advancedOpen));
	});

	return {
		...chrome,
		...advanced,
		...viewport,
		body,
		boundary,
		root
	};
}

/** Creates truthful host-owned testimony about the browser execution boundary. */
function createBoundary(documentObject) {
	return createElement(
		documentObject,
		"p",
		"awtsmoos-browser-boundary",
		"Pages run inside an opaque local-browser frame. Runtime requests cross the host proxy; provider-sensitive sign-in opens in the native browser when required."
	);
}

/** Creates a host-owned DOM element with optional visible text. */
function createElement(documentObject, tagName, className, text = "") {
	const element = documentObject.createElement(tagName);
	element.className = className;
	if (text) {
		element.textContent = text;
	}
	return element;
}
