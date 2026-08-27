// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalApiFamilyRenderer
 * @description
 * The Awtsmoos renews every API family while each finite path still deserves a plain explanation and door;
 * Awtsmoos.com renders existing catalog families as stable product UI, proving the Portal wraps real legacy data instead of synthetic lore.
 */

import { portalElement } from "../PortalDom.js";
import { renderPortalResourceHeader } from "./PortalResourceChrome.js";

/**
 * @description Renders an API-family resource as a compact card suitable for collections.
 * @param {Object} resource - Normalized `awtsmoos.api-family` resource.
 * @param {Object} context - Renderer context, optionally exposing navigation callbacks.
 * @returns {HTMLElement} API-family card.
 */
export function renderPortalApiFamilyCard(resource, context = {}) {
	const data = resource.data || {};
	const openResource = typeof context.openResource === "function"
		? context.openResource
		: null;
	const button = portalElement("button", {
		classes: "portal-card-action",
		attributes: { type: "button" },
		text: "Inspect"
	});

	if (openResource) {
		button.addEventListener("click", () => openResource(resource));
	} else {
		button.disabled = true;
	}

	return portalElement("article", {
		classes: ["portal-card", "portal-api-family-card"],
		children: [
			portalElement("p", {
				classes: "portal-kicker",
				text: "API family"
			}),
			portalElement("h3", {
				classes: "portal-card-title",
				text: resource.title
			}),
			portalElement("p", {
				classes: "portal-card-description",
				text: data.description || "Existing Awtsmoos API family."
			}),
			portalElement("code", {
				classes: "portal-card-path",
				text: data.path || resource.links?.legacy || ""
			}),
			button
		]
	});
}

/**
 * @description Renders an API-family resource detail with its original catalog path and description preserved.
 * @param {Object} resource - Normalized `awtsmoos.api-family` resource.
 * @returns {HTMLElement} API-family detail view.
 */
export function renderPortalApiFamilyDetail(resource) {
	const data = resource.data || {};
	const legacyPath = data.path || resource.links?.legacy || "";

	return portalElement("article", {
		classes: ["portal-resource", "portal-api-family-detail"],
		children: [
			renderPortalResourceHeader(resource, { kicker: "Existing API family" }),
			portalElement("p", {
				classes: "portal-lead",
				text: data.description || "Existing API family adapted into the universal Portal contract."
			}),
			portalElement("dl", {
				classes: "portal-facts",
				children: [
					portalElement("dt", { text: "Legacy path" }),
					portalElement("dd", {
						children: [portalElement("code", { text: legacyPath || "—" })]
					}),
					portalElement("dt", { text: "Portal type" }),
					portalElement("dd", {
						children: [portalElement("code", { text: resource.type })]
					})
				]
			}),
			legacyPath ? portalElement("a", {
				classes: "portal-primary-link",
				text: "Open legacy API",
				attributes: { href: legacyPath }
			}) : null
		]
	});
}
