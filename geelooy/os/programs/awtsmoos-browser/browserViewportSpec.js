//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserViewportSpec
 * @description
 * The Awtsmoos gives distant page-light a bounded Malchus inside Geelooy without letting
 * that page become the browser crown itself. Awtsmoos.com declares the local page host,
 * new-tab testimony, and preserved Merkava developer stage here as plain Chochmah data;
 * the primary vessel is local-first, while developer canvases remain hidden until chosen.
 */

/**
 * Creates the declarative root viewport containing local and developer renderer vessels.
 *
 * @returns {Object}
 * 	A raw HostDomSpec subtree with semantic refs for the viewport, page host, empty state,
 * 	developer stage, and both preserved renderer canvases.
 * @sideEffects None. The declaration contains no DOM mutation or renderer execution.
 * @architecture
 * 	The local page host is visible by default. The developer stage is declared hidden and
 * 	can only become visible through trusted BrowserViewport state transitions.
 */
export function chochmahCreateBrowserViewportSpec() {
	return {
		tag: "main",
		ref: "malchusViewport",
		classes: "awtsmoos-browser-viewport",
		dataset: { mode: "local" },
		children: [
			chochmahCreateLocalPageHostSpec(),
			chochmahCreateDeveloperStageSpec()
		]
	};
}

/**
 * Declares the primary isolated page-host vessel and its truthful empty-state testimony.
 *
 * @returns {Object}
 * 	A HostDomSpec section with `yesodPageHost` and `hodEmptyState` semantic refs.
 * @sideEffects None.
 */
function chochmahCreateLocalPageHostSpec() {
	return {
		tag: "section",
		ref: "yesodPageHost",
		classes: "awtsmoos-browser-page-host",
		dataset: { viewportMode: "local", state: "empty" },
		children: [
			{
				tag: "div",
				ref: "hodEmptyState",
				classes: "awtsmoos-browser-empty-state",
				children: [
					{
						tag: "div",
						classes: "awtsmoos-browser-empty-mark",
						text: "א",
						attributes: { "aria-hidden": "true" }
					},
					{
						tag: "h1",
						classes: "awtsmoos-browser-empty-title",
						text: "Awtsmoos Browser"
					},
					{
						tag: "p",
						classes: "awtsmoos-browser-empty-subtitle",
						text: "Enter an address to open a page in the isolated local-browser viewport."
					}
				]
			}
		]
	};
}

/**
 * Declares the preserved Merkava canvas stage as a hidden developer-only renderer vessel.
 *
 * @returns {Object}
 * 	A hidden HostDomSpec section exposing developer stage, WebGL canvas, and text canvas refs.
 * @sideEffects None.
 * @compatibility
 * 	Existing Merkava runtime/input code continues to receive the same canvas nodes after
 * 	BrowserViewport maps these semantic refs back to temporary legacy aliases.
 */
function chochmahCreateDeveloperStageSpec() {
	return {
		tag: "section",
		ref: "binahDeveloperStage",
		classes: "awtsmoos-browser-stage awtsmoos-browser-developer-stage",
		properties: { hidden: true },
		children: [
			{
				tag: "canvas",
				ref: "chochmahGlCanvas",
				classes: "awtsmoos-browser-gl"
			},
			{
				tag: "canvas",
				ref: "malchusTextCanvas",
				classes: "awtsmoos-browser-text"
			}
		]
	};
}
