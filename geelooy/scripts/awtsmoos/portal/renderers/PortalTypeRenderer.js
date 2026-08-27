// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalTypeRenderer
 * @description
 * The Awtsmoos renews every named type without becoming confined by any name that finite schema can cite;
 * Awtsmoos.com gives type definitions a compact card so discovery stays readable on a phone while lifecycle and version remain in sight.
 */

import { portalElement } from "../PortalDom.js";

/**
 * @description Renders a Portal type-definition resource as a compact collection card.
 * @param {Object} resource - Normalized `awtsmoos.portal-type` resource.
 * @returns {HTMLElement} Compact type-definition card.
 */
export function renderPortalTypeCard(resource) {
	const definition = resource.data || {};
	const lifecycle = definition.lifecycle || "unknown";
	const version = definition.version || "unknown";
	const description = typeof definition.description === "string"
		? definition.description.slice(0, 420)
		: "Portal resource type definition.";

	return portalElement("article", {
		classes: ["portal-card", "portal-type-card"],
		children: [
			portalElement("p", {
				classes: "portal-kicker",
				text: "Resource type"
			}),
			portalElement("h3", {
				classes: "portal-card-title",
				text: definition.label || resource.title
			}),
			portalElement("code", {
				classes: "portal-card-path",
				text: resource.id
			}),
			portalElement("p", {
				classes: "portal-card-description",
				text: description || "No description provided."
			}),
			portalElement("div", {
				classes: "portal-card-meta",
				children: [
					portalElement("span", {
						classes: "portal-badge",
						text: lifecycle
					}),
					portalElement("span", {
						classes: "portal-badge",
						text: `v${version}`
					})
				]
			})
		]
	});
}
