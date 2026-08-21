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
 * @param {Document} documentObject
 * 	The host document used to create browser-owned DOM elements.
 * @returns {Object}
 * 	References to the toolbar, omnibox, tab shell, progress rail, navigation slot,
 * 	mode badge, and advanced-drawer toggle.
 * @throws {TypeError}
 * 	Thrown naturally when the supplied document cannot create DOM elements.
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
	newTabButton.dataset.action = "new-tab";
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

	const modeBadge = createElement(documentObject, "span", "awtsmoos-browser-mode-badge", "Local");
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

/**
 * Creates one accessible host-owned button.
 *
 * @param {Document} documentObject Host document that owns the trusted chrome.
 * @param {string} className CSS class list applied to the button.
 * @param {string} label Accessible action label.
 * @param {string} [text=""] Visible button text.
 * @returns {HTMLButtonElement} The configured button element.
 */
function createButton(documentObject, className, label, text = "") {
	const button = createElement(documentObject, "button", className, text);
	button.type = "button";
	button.setAttribute("aria-label", label);
	return button;
}

/**
 * Creates a host DOM element with optional text while keeping construction explicit.
 *
 * @param {Document} documentObject Host document receiving the element.
 * @param {string} tagName DOM tag name to create.
 * @param {string} className CSS class list applied to the element.
 * @param {string} [text=""] Optional text content.
 * @returns {HTMLElement} The created host element.
 */
function createElement(documentObject, tagName, className, text = "") {
	const element = documentObject.createElement(tagName);
	element.className = className;
	if (text) {
		element.textContent = text;
	}
	return element;
}
