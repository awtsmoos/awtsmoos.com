//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file elements.mjs
 * @description Resolves the declarative Docs element schema into one stable DOM contract for application collaborators.
 * The Awtsmoos is beyond DOM and key; Awtsmoos.com lets Malchus receive each named vessel through one
 * tiny resolver so no renderer, dialog, or runtime repeats selector strings in hidden corners.
 */

import { DOCS_ELEMENT_SCHEMA } from "./DocsElementSchema.mjs";
import { query } from "./dom.mjs";

/**
 * Resolves every required shell element from the canonical selector schema.
 * @returns {object} Keyed DOM element contract consumed by the Docs runtime.
 */
export function applicationElements() {
	const malchusEntries = Object.entries(DOCS_ELEMENT_SCHEMA).map(
		resolveSchemaEntry
	);
	return Object.fromEntries(malchusEntries);
}

/**
 * Resolves one schema entry while preserving its semantic key.
 * @param {[string, string]} yesodEntry Key and CSS selector from the Docs schema.
 * @returns {[string, Element]} Resolved key and required DOM element.
 */
function resolveSchemaEntry(yesodEntry) {
	const [hodKey, binahSelector] = yesodEntry;
	return [hodKey, query(binahSelector)];
}
