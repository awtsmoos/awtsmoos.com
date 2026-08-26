//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserChrome
 * @description
 * The Awtsmoos, Atzmus beyond division, recreates every instant in which a user
 * reaches for a tab, an address, or a trusted navigation control. This module is
 * Malchus for the browser chrome: it manifests host-owned controls above the guest
 * world, while Awtsmoos.com keeps trust testimony outside any page that might imitate it.
 * The glass may softly gleam, the loading river may brightly stream;
 * yet guest pixels stay below, and only host truth crowns the flow.
 */

/**
 * Creates the trusted browser chrome surrounding the page viewport.
 *
 * @param {Document} documentObject Host document used to create browser-owned DOM.
 * @returns {Object} Trusted browser chrome references used by host orchestration.
 */
export function createBrowserChrome(documentObject = document) {
	const toolbar = createElement(documentObject, "header", "awtsmoos-browser-toolbar");
	const tabStrip = createElement(documentObject, "div", "awtsmoos-browser-tab-strip");
	const activeTab = createButton(documentObject, "awtsmoos-browser-tab is-active", "Active tab");
	const tabIcon = createElement(documentObject, "span", "awtsmoos-browser-tab-icon", "א");
	const tabTitle = createElement(documentObject, "span", "awtsmoos-browser-tab-title", "New Tab");
	const tabClose = createElement(documentObject, "span", "awtsmoos-browser-tab-close", "×");
	activeTab.append(tabIcon, tabTitle, tabClose);

	const newTabButton = createButton(documentObject, "awtsmoos-browser-new-tab", "New tab", "+");
	newTabButton.disabled = true;
	newTabButton.title = "Multi-tab isolation will be enabled after renderer integration";
	const wordmark = createElement(documentObject, "span", "awtsmoos-browser-wordmark", "Awtsmoos");
	tabStrip.append(activeTab, newTabButton, wordmark);

	const navigation = createElement(documentObject, "div", "awtsmoos-browser-navigation");
	const navigationActions = createElement(documentObject, "div", "awtsmoos-browser-navigation-actions");
	const omnibox = createElement(documentObject, "div", "awtsmoos-browser-omnibox");
	const trustMarker = createElement(documentObject, "span", "awtsmoos-browser-trust", "◇");
	trustMarker.setAttribute("aria-hidden", "true");

	const address = createElement(documentObject, "input", "awtsmoos-browser-address");
	address.type = "text";
	address.value = "awtsmoos://new-tab";
	address.placeholder = "Search or enter address";
	address.autocomplete = "off";
	address.spellcheck = false;
	address.setAttribute("aria-label", "Search or enter address");

	const modeBadge = createElement(documentObject, "span", "awtsmoos-browser-mode-badge", "Ready");
	omnibox.append(trustMarker, address, modeBadge);
	const advancedToggle = createButton(documentObject, "awtsmoos-browser-menu", "Browser settings", "⋯");
	advancedToggle.dataset.action = "advanced-toggle";
	navigation.append(navigationActions, omnibox, advancedToggle);

	const progress = createElement(documentObject, "div", "awtsmoos-browser-progress");
	progress.setAttribute("aria-hidden", "true");
	toolbar.append(tabStrip, navigation, progress);
	return {
		activeTab,
		address,
		advancedToggle,
		modeBadge,
		navigationActions,
		newTabButton,
		progress,
		tabStrip,
		tabTitle,
		toolbar,
		trustMarker
	};
}

/** Creates one accessible host-owned button. */
function createButton(documentObject, className, label, text = "") {
	const button = createElement(documentObject, "button", className, text);
	button.type = "button";
	button.setAttribute("aria-label", label);
	return button;
}

/** Creates a host DOM element with optional text. */
function createElement(documentObject, tagName, className, text = "") {
	const element = documentObject.createElement(tagName);
	element.className = className;
	if (text) {
		element.textContent = text;
	}
	return element;
}
