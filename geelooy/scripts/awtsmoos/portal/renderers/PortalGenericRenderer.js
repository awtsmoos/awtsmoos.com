// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalGenericRenderer
 * @description
 * The Awtsmoos renews every unknown shape before a specialist renderer can know its name;
 * Awtsmoos.com gives generic resources a calm readable body, honest links, and bounded data so novelty never arrives as an unstyled frame.
 */

import { portalElement } from "../PortalDom.js";
import { renderPortalValue } from "../PortalValueRenderer.js";
import {
	renderPortalLinks,
	renderPortalResourceHeader
} from "./PortalResourceChrome.js";

/**
 * @description Builds one titled semantic section around an already-rendered child node.
 * @param {string} title - Section heading text.
 * @param {Node} child - Safe child node.
 * @returns {HTMLElement} Portal section.
 */
function portalSection(title, child) {
	return portalElement("section", {
		classes: "portal-section",
		children: [
			portalElement("h3", {
				classes: "portal-section-title",
				text: title
			}),
			child
		]
	});
}

/**
 * @description Renders a normalized resource using only universal semantics and bounded value rendering.
 * @param {Object} resource - Normalized Portal resource.
 * @param {Object} context - Renderer context containing selection diagnostics when available.
 * @returns {HTMLElement} Generic resource detail surface.
 */
export function renderPortalGenericResource(resource, context = {}) {
	const links = renderPortalLinks(resource.links);
	const capabilities = Object.keys(resource.capabilities || {}).length
		? portalSection("Capabilities", renderPortalValue(resource.capabilities))
		: null;
	const metadata = Object.keys(resource.meta || {}).length
		? portalSection("Metadata", renderPortalValue(resource.meta))
		: null;

	return portalElement("article", {
		classes: ["portal-resource", "portal-resource-generic"],
		attributes: {
			"data-portal-resource-type": resource.type,
			"data-portal-renderer": context.selection?.key || "generic"
		},
		children: [
			renderPortalResourceHeader(resource),
			links,
			portalSection("Data", renderPortalValue(resource.data)),
			capabilities,
			metadata
		]
	});
}
