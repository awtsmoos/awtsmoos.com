// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalUnknownRenderer
 * @description
 * The Awtsmoos renews kinds no present client has named, yet no future type should arrive as a crash or naked dump;
 * Awtsmoos.com keeps unknown cards compact and detail views fully inspectable so tomorrow begins usable instead of broken at the jump.
 */

import { portalElement } from "../PortalDom.js";
import { renderPortalGenericResource } from "./PortalGenericRenderer.js";

/**
 * @description Renders an unknown resource as a small collection card when a specialist card renderer does not exist.
 * @param {Object} resource - Normalized unknown resource.
 * @returns {HTMLElement} Compact compatibility card.
 */
function renderPortalUnknownCard(resource) {
	return portalElement("article", {
		classes: ["portal-card", "portal-unknown-card"],
		children: [
			portalElement("p", {
				classes: "portal-kicker",
				text: "Generic resource"
			}),
			portalElement("h3", {
				classes: "portal-card-title",
				text: resource.title
			}),
			portalElement("code", {
				classes: "portal-card-path",
				text: resource.type
			}),
			portalElement("p", {
				classes: "portal-card-description",
				text: "No specialized card renderer is registered yet; the resource remains available through its universal detail and inspector views."
			})
		]
	});
}

/**
 * @description Renders an unrecognized Portal type with a clear compatibility notice and bounded generic detail, or a compact card inside collections.
 * @param {Object} resource - Normalized unknown resource.
 * @param {Object} context - Renderer context with requested view and selection diagnostics.
 * @returns {HTMLElement} Unknown-type fallback surface.
 */
export function renderPortalUnknownResource(resource, context = {}) {
	if (context.view === "card") {
		return renderPortalUnknownCard(resource);
	}

	return portalElement("div", {
		classes: "portal-unknown-shell",
		children: [
			portalElement("div", {
				classes: "portal-compatibility-note",
				attributes: { role: "status" },
				children: [
					portalElement("strong", {
						text: "Generic compatibility view"
					}),
					portalElement("span", {
						text: ` No specialized renderer is registered for ${resource.type}; the resource is still fully inspectable.`
					})
				]
			}),
			renderPortalGenericResource(resource, context)
		]
	});
}
