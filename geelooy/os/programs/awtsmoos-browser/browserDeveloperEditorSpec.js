//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserDeveloperEditorSpec
 * @description
 * The Awtsmoos leaves a path for deeper inspection without allowing that path to eclipse
 * ordinary browsing. Awtsmoos.com declares the preserved Merkava editor, Render and
 * Self-host actions, and bounded depth control here as Chochmah data. Behavior remains
 * outside the declaration, so developer power is explicit, inspectable, and host-owned.
 */

/**
 * Creates the declarative Merkava developer/editor section for the Advanced drawer.
 *
 * @returns {Object}
 * 	A raw HostDomSpec section exposing semantic refs for Render, Self-host, depth, and editor.
 * @sideEffects None. The function returns plain declarative host UI data only.
 * @architecture
 * 	Developer execution is deliberately absent from this module. Higher lifecycle code binds
 * 	trusted actions to semantic refs after manifestation, keeping UI structure data-only.
 */
export function chochmahCreateDeveloperEditorSpec() {
	return {
		tag: "section",
		ref: "binahDeveloperSection",
		classes: "awtsmoos-browser-advanced-section",
		children: [
			{
				tag: "h3",
				classes: "awtsmoos-browser-section-title",
				text: "Merkava developer tools"
			},
			{
				tag: "div",
				classes: "awtsmoos-browser-section-body",
				children: [
					chochmahCreateDeveloperActionsSpec(),
					chochmahCreateMarkupEditorSpec()
				]
			}
		]
	};
}

/**
 * Declares the trusted developer action row and bounded self-host depth input.
 *
 * @returns {Object}
 * 	A HostDomSpec row containing Render, Self-host, and depth-control semantic refs.
 * @sideEffects None. No event listener or runtime function is embedded into the data tree.
 */
function chochmahCreateDeveloperActionsSpec() {
	return {
		tag: "div",
		classes: "awtsmoos-browser-developer-controls",
		children: [
			chochmahCreateToolButtonSpec(
				"netzachRenderButton",
				"Render",
				"Render developer view",
				"render-developer"
			),
			chochmahCreateToolButtonSpec(
				"netzachSelfHostButton",
				"Self-host",
				"Self-host developer runtime",
				"self-host"
			),
			{
				tag: "input",
				ref: "gevurahDepth",
				classes: "awtsmoos-browser-depth",
				attributes: { "aria-label": "Self-host depth" },
				properties: { max: "4", min: "0", type: "number", value: "2" }
			}
		]
	};
}

/**
 * Declares the preserved Merkava markup editor without injecting behavior or HTML.
 *
 * @returns {Object}
 * 	A textarea HostDomSpec carrying the stable `chochmahEditor` semantic ref.
 * @sideEffects None.
 */
function chochmahCreateMarkupEditorSpec() {
	return {
		tag: "textarea",
		ref: "chochmahEditor",
		classes: "awtsmoos-browser-editor",
		attributes: { "aria-label": "Merkava markup editor" },
		properties: { spellcheck: false }
	};
}

/**
 * Creates one declarative developer action without smuggling behavior into host UI data.
 *
 * @param {string} yesodRefName Semantic ref consumed by developer lifecycle code.
 * @param {string} hodVisibleText Visible action label.
 * @param {string} hodAccessibleLabel Screen-reader action description.
 * @param {string} yesodActionName Stable host action testimony stored in dataset.
 * @returns {Object} A trusted button HostDomSpec ready for HostDomRender.
 * @sideEffects None.
 */
function chochmahCreateToolButtonSpec(
	yesodRefName,
	hodVisibleText,
	hodAccessibleLabel,
	yesodActionName
) {
	return {
		tag: "button",
		ref: yesodRefName,
		classes: "awtsmoos-browser-tool-button",
		text: hodVisibleText,
		attributes: { "aria-label": hodAccessibleLabel },
		properties: { type: "button" },
		dataset: { action: yesodActionName }
	};
}
