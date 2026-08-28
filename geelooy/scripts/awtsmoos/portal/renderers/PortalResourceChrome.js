// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalResourceChrome
 * @description
 * The Awtsmoos renews identity before any renderer can dress a resource in finite form;
 * Awtsmoos.com gives every generic surface one calm header, type receipt, and trusted navigation frame without futuristic storm.
 */

import { portalElement } from "../PortalDom.js";

/**
 * @description Creates the shared title/type header used by generic Portal resource renderers.
 * @param {Object} resource - Normalized Portal resource envelope.
 * @param {Object} [options={}] - Header options.
 * @param {string} [options.kicker] - Optional short contextual label.
 * @returns {HTMLElement} Semantic resource header.
 */
export function renderPortalResourceHeader(resource, options = {}) {
	const kicker = options.kicker || resource.type;

	return portalElement("header", {
		classes: "portal-resource-header",
		children: [
			portalElement("p", {
				classes: "portal-kicker",
				text: kicker
			}),
			portalElement("h2", {
				classes: "portal-resource-title",
				text: resource.title
			}),
			portalElement("p", {
				classes: "portal-resource-id",
				children: [
					portalElement("code", { text: resource.id })
				]
			})
		]
	});
}

/**
 * @description Creates a safe action/link row from resource link metadata; only ordinary href values are exposed and PortalDom rejects javascript URLs.
 * @param {Object} links - Portal resource link record.
 * @returns {HTMLElement|null} Navigation row or null when no links exist.
 */
export function renderPortalLinks(links) {
	const entries = Object.entries(links || {})
		.filter(([, href]) => typeof href === "string" && href.trim())
		.slice(0, 16);

	if (!entries.length) {
		return null;
	}

	return portalElement("nav", {
		classes: "portal-link-row",
		attributes: { "aria-label": "Resource links" },
		children: entries.map(([relation, href]) => portalElement("a", {
			classes: "portal-link",
			text: relation,
			attributes: {
				href,
				rel: href.startsWith("http") ? "noopener noreferrer" : null,
				target: href.startsWith("http") ? "_blank" : null
			}
		}))
	});
}
