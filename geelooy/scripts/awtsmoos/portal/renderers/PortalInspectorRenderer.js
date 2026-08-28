// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalInspectorRenderer
 * @description
 * The Awtsmoos renews every finite contract while the developer still needs to see how a resource entered the frame;
 * Awtsmoos.com exposes identity, schema, links, capabilities, metadata, extensions, and renderer choice so generic behavior never becomes mysterious by name.
 */

import { portalElement } from "../PortalDom.js";
import { renderPortalValue } from "../PortalValueRenderer.js";
import { renderPortalResourceHeader } from "./PortalResourceChrome.js";

/**
 * @description Creates one inspector section around arbitrary bounded contract data.
 * @param {string} title - Inspector section heading.
 * @param {unknown} value - Contract value to render safely.
 * @returns {HTMLElement} Inspector section.
 */
function inspectorSection(title, value) {
	return portalElement("section", {
		classes: "portal-inspector-section",
		children: [
			portalElement("h3", {
				classes: "portal-section-title",
				text: title
			}),
			renderPortalValue(value)
		]
	});
}

/**
 * @description Renders a developer-oriented contract inspector without allowing resource data to execute as markup.
 * @param {Object} resource - Normalized Portal resource.
 * @param {Object} context - Renderer context including selection and registry diagnostics.
 * @returns {HTMLElement} Resource inspector surface.
 */
export function renderPortalInspector(resource, context = {}) {
	const diagnostics = {
		requestedView: context.view || "inspector",
		selectedKey: context.selection?.key || null,
		selectionReason: context.selection?.reason || "unknown",
		registeredRendererKeys: context.registry?.keys?.() || []
	};

	return portalElement("article", {
		classes: ["portal-resource", "portal-inspector"],
		children: [
			renderPortalResourceHeader(resource, { kicker: "Resource Inspector" }),
			inspectorSection("Envelope", {
				envelopeVersion: resource.envelopeVersion,
				id: resource.id,
				type: resource.type,
				title: resource.title
			}),
			inspectorSection("Schema", resource.schema),
			inspectorSection("Links", resource.links),
			inspectorSection("Capabilities", resource.capabilities),
			inspectorSection("Metadata", resource.meta),
			inspectorSection("Extensions", resource.extensions),
			inspectorSection("Renderer diagnostics", diagnostics),
			inspectorSection("Data", resource.data)
		]
	});
}
