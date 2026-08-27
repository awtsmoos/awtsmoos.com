//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserViewport
 * @description
 * The Awtsmoos gives Malchus a place where distant pages may become visible nearby.
 * Awtsmoos.com keeps the local embedded browser as the primary vessel, while the old
 * Merkava canvases remain behind a developer curtain: light may change its keli,
 * yet the host still knows which world is manifest and which remains hidden from view.
 */

const VIEWPORT_MODE_LOCAL = "local";
const VIEWPORT_MODE_DEVELOPER = "developer";

/**
 * Creates the page viewport and preserved developer-renderer stage.
 *
 * @param {Document} documentObject
 * 	The host document that owns the trusted browser application surface.
 * @returns {Object}
 * 	The local page host, empty-state content, legacy canvases, developer stage,
 * 	viewport root, and a mode setter controlling which renderer is visible.
 */
export function createBrowserViewport(documentObject = document) {
	const viewport = createElement(documentObject, "main", "awtsmoos-browser-viewport");
	const pageHost = createElement(documentObject, "section", "awtsmoos-browser-page-host");
	pageHost.dataset.viewportMode = VIEWPORT_MODE_LOCAL;

	const emptyState = createEmptyState(documentObject);
	pageHost.append(emptyState);

	const developerStage = createElement(
		documentObject,
		"section",
		"awtsmoos-browser-stage awtsmoos-browser-developer-stage"
	);
	developerStage.hidden = true;

	const glCanvas = createElement(documentObject, "canvas", "awtsmoos-browser-gl");
	const textCanvas = createElement(documentObject, "canvas", "awtsmoos-browser-text");
	developerStage.append(glCanvas, textCanvas);
	viewport.append(pageHost, developerStage);

	/**
	 * Selects which renderer vessel is visible without changing renderer state.
	 *
	 * @param {"local"|"developer"} mode
	 * 	The trusted host-selected viewport mode.
	 * @returns {string}
	 * 	The normalized active viewport mode.
	 * @throws {TypeError}
	 * 	Thrown when a caller requests an unknown renderer mode.
	 */
	function setViewportMode(mode) {
		if (![VIEWPORT_MODE_LOCAL, VIEWPORT_MODE_DEVELOPER].includes(mode)) {
			throw new TypeError("BROWSER_VIEWPORT_MODE_INVALID");
		}
		const localVisible = mode === VIEWPORT_MODE_LOCAL;
		pageHost.hidden = !localVisible;
		developerStage.hidden = localVisible;
		viewport.dataset.mode = mode;
		return mode;
	}

	setViewportMode(VIEWPORT_MODE_LOCAL);
	return {
		developerStage,
		emptyState,
		glCanvas,
		pageHost,
		setViewportMode,
		stage: developerStage,
		textCanvas,
		viewport
	};
}

/**
 * Creates the quiet new-tab/empty state shown before a page is mounted.
 *
 * @param {Document} documentObject Host document receiving the empty-state elements.
 * @returns {HTMLElement} The complete empty-state card.
 */
function createEmptyState(documentObject) {
	const card = createElement(documentObject, "div", "awtsmoos-browser-empty-state");
	const mark = createElement(documentObject, "div", "awtsmoos-browser-empty-mark", "א");
	const title = createElement(documentObject, "h1", "awtsmoos-browser-empty-title", "Awtsmoos Browser");
	const subtitle = createElement(
		documentObject,
		"p",
		"awtsmoos-browser-empty-subtitle",
		"Enter an address to open a page in your local browser engine."
	);
	card.append(mark, title, subtitle);
	return card;
}

/**
 * Creates one host-owned DOM element with optional visible text.
 *
 * @param {Document} documentObject Host document that owns the element.
 * @param {string} tagName DOM tag name to create.
 * @param {string} className CSS class list applied to the element.
 * @param {string} [text=""] Optional text content.
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
