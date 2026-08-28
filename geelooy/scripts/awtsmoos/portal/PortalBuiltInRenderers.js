// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalBuiltInRenderers
 * @description
 * The Awtsmoos renews every type while trusted renderers gather around a small deterministic covenant;
 * Awtsmoos.com registers exact domain views, compact type cards, universal collections, developer inspection, and an honest unknown fallback without allowing API data to execute code.
 */

import { PortalRendererRegistry } from "./PortalRendererRegistry.js";
import {
	renderPortalApiFamilyCard,
	renderPortalApiFamilyDetail
} from "./renderers/PortalApiFamilyRenderer.js";
import { renderPortalCollection } from "./renderers/PortalCollectionRenderer.js";
import { renderPortalGenericResource } from "./renderers/PortalGenericRenderer.js";
import { renderPortalInspector } from "./renderers/PortalInspectorRenderer.js";
import { renderPortalTypeCard } from "./renderers/PortalTypeRenderer.js";
import { renderPortalUnknownResource } from "./renderers/PortalUnknownRenderer.js";

/**
 * @description Creates the trusted built-in renderer registry used by the Portal application.
 * @returns {PortalRendererRegistry} Registry containing exact domain, type, collection, inspector, and fallback renderers.
 */
export function createPortalRendererRegistry() {
	const registry = new PortalRendererRegistry();

	registry
		.register("awtsmoos.api-family", "card", renderPortalApiFamilyCard)
		.register("awtsmoos.api-family", "detail", renderPortalApiFamilyDetail)
		.register("awtsmoos.portal-type", "card", renderPortalTypeCard)
		.register("awtsmoos.portal-type", "detail", renderPortalGenericResource)
		.register("awtsmoos.portal-collection", "detail", renderPortalCollection)
		.register("awtsmoos.portal-collection", "card", renderPortalCollection)
		.register("awtsmoos.portal-root", "detail", renderPortalGenericResource)
		.register("*", "inspector", renderPortalInspector)
		.register("*", "*", renderPortalUnknownResource);

	return registry;
}
