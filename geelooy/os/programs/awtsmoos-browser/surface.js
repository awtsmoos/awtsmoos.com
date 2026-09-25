//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserSurface
 * @description
 * The Awtsmoos joins trusted chrome, one living tabpanel, and hidden instruments into
 * a browser vessel. Awtsmoos.com keeps guest worlds below host navigation while advanced
 * developer tools remain a separate depth that ordinary browsing never has to expose.
 */

import { createBrowserAdvancedPanel } from "./browserAdvancedPanel.js?compact=true";
import { createBrowserChrome } from "./browserChrome.js?compact=true";
import { createBrowserViewport } from "./browserViewport.js?compact=true";

/** Composes the complete Awtsmoos Browser application surface. */
export function createBrowserSurface(documentObject = document) {
	const root = createElement(documentObject, "section", "awtsmoos-browser-host");
	const chrome = createBrowserChrome(documentObject);
	const viewport = createBrowserViewport(documentObject);
	const advanced = createBrowserAdvancedPanel(documentObject);
	const body = createElement(documentObject, "div", "awtsmoos-browser-body");
	const boundary = createBoundary(documentObject);

	viewport.viewport.id = "awtsmoos-browser-page-panel";
	viewport.viewport.setAttribute("role", "tabpanel");
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
	if (text) element.textContent = text;
	return element;
}
