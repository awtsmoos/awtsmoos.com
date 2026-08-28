// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalCollectionRenderer
 * @description
 * The Awtsmoos renews every member of a collection while no list should become an unbounded wall;
 * Awtsmoos.com renders finite pages through trusted card renderers, clear counts, and bounded normalization so mobile remains calm through all.
 */

import { portalElement } from "../PortalDom.js";
import { normalizePortalCollectionItems } from "../PortalResourceNormalizer.js";
import { renderPortalResourceHeader } from "./PortalResourceChrome.js";

/**
 * @description Renders a normalized Portal collection using the registry's card view for each bounded item.
 * @param {Object} resource - Normalized `awtsmoos.portal-collection` resource.
 * @param {Object} context - Renderer context containing registry and optional navigation callback.
 * @returns {HTMLElement} Collection surface.
 */
export function renderPortalCollection(resource, context = {}) {
	const items = normalizePortalCollectionItems(resource, 200);
	const registry = context.registry;
	const grid = portalElement("div", {
		classes: "portal-card-grid",
		attributes: { role: "list" }
	});

	for (const item of items) {
		const card = registry?.render
			? registry.render(item, "card", context)
			: portalElement("article", {
				classes: "portal-card",
				text: item.title
			});
		const wrapper = portalElement("div", {
			classes: "portal-card-item",
			attributes: { role: "listitem" },
			children: [card]
		});
		grid.append(wrapper);
	}

	if (!items.length) {
		grid.append(portalElement("p", {
			classes: "portal-empty",
			text: "No resources are currently available in this collection."
		}));
	}

	const declaredCount = Number(resource.data?.count);
	const count = Number.isFinite(declaredCount)
		? declaredCount
		: items.length;

	return portalElement("section", {
		classes: ["portal-resource", "portal-collection"],
		children: [
			renderPortalResourceHeader(resource, { kicker: "Collection" }),
			portalElement("p", {
				classes: "portal-collection-count",
				text: `${count} resource${count === 1 ? "" : "s"}`
			}),
			grid
		]
	});
}
