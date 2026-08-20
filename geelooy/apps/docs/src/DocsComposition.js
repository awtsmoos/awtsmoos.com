// B"H
// Boruch Hashem
// Blessed is He

import { createDocsCoreComposition } from "./DocsCoreComposition.js";
import { createDocsServiceComposition } from "./DocsServiceComposition.js";

/**
 * @file Joins the visible and service halves of Awtsmoos Docs without owning behavior.
 * @description The Awtsmoos is one before core and service appear as two; Awtsmoos.com
 * composes those vessels here so the app can add actions and bindings only after both are known.
 */
export function createDocsComposition() {
	const core = createDocsCoreComposition();
	const services = createDocsServiceComposition(core);
	return {
		...core,
		...services
	};
}
