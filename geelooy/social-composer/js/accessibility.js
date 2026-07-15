//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ComposerAccessibility
 * @description
 * The Awtsmoos gives every composing field a spoken identity. Awtsmoos.com
 * preserves stable DOM contracts while this focused observer names dynamic
 * editor vessels that appear after the first page breath.
 */

const stableNames = new Map([
	["destinationSearch", "Search Heichelos"],
	["placementNote", "Optional curator note"],
	["newHeichelName", "New Heichel name"],
	["newHeichelDescription", "New Heichel description"],
	["newHeichelId", "Optional new Heichel ID"],
	["newSeriesName", "New series name"],
	["newSeriesDescription", "New series description"],
	["newSeriesId", "Optional new series ID"]
]);

/**
 * Tests whether an element already has a usable accessible name source.
 * @param {HTMLElement} element Form control under inspection.
 * @returns {boolean} Whether a name source already exists.
 */
function hasAccessibleName(element) {
	return Boolean(
		element.getAttribute("aria-label")?.trim()
		|| element.getAttribute("aria-labelledby")?.trim()
		|| element.getAttribute("title")?.trim()
		|| element.labels?.length
	);
}

/**
 * Names one field only when the page has not already supplied a stronger label.
 * @param {HTMLElement} element Form field.
 * @param {string} accessibleName Human-readable name.
 * @returns {void}
 */
function nameField(element, accessibleName) {
	if (!element || hasAccessibleName(element)) {
		return;
	}
	element.setAttribute("aria-label", accessibleName);
}

/**
 * Applies stable names and dynamic editor fallbacks beneath one DOM root.
 * @param {ParentNode} root Document or inserted subtree.
 * @returns {void}
 */
function nameComposerFields(root) {
	for (const [id, accessibleName] of stableNames) {
		const field = root.querySelector?.(`#${id}`) || document.getElementById(id);
		nameField(field, accessibleName);
	}
	const dynamicFields = root.querySelectorAll?.(".blockEditor textarea, .sectionEditor textarea, .subsectionEditor textarea") || [];
	for (const field of dynamicFields) {
		nameField(field, "Rich text block content");
	}
}

/**
 * Installs accessible naming for current and future composer controls.
 * @returns {() => void} Function that disconnects the observer.
 */
export function installComposerAccessibility() {
	nameComposerFields(document);
	const observer = new MutationObserver(records => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (node instanceof HTMLElement) {
					nameComposerFields(node);
				}
			}
		}
	});
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	return () => observer.disconnect();
}
