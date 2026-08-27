// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalRouteLoader
 * @description
 * The Awtsmoos renews each requested route while transport and presentation remain separate vessels of one light;
 * Awtsmoos.com maps stable browser routes to read-only Portal API calls so navigation stays explicit, testable, and right.
 */

import { normalizePortalResource } from "/scripts/awtsmoos/portal/PortalResourceNormalizer.js";

/**
 * @description Loads and normalizes the resource represented by one Portal page route.
 * @param {Object} client - PortalApiClient instance.
 * @param {{section:string,id:string}} route - Normalized Portal route.
 * @returns {Promise<Object>} Normalized Portal resource.
 * @throws {TypeError} When a route cannot map to a supported read-only Portal operation.
 */
export async function loadPortalRoute(client, route) {
	let payload;

	switch (route.section) {
		case "root":
			payload = await client.root();
			break;
		case "types":
			payload = await client.types();
			break;
		case "families":
			payload = await client.apiFamilies();
			break;
		case "family":
			if (!route.id) {
				throw new TypeError("API-family route requires an id.");
			}
			payload = await client.apiFamily(route.id);
			break;
		default:
			throw new TypeError(`Unsupported Portal section: ${route.section}`);
	}

	return normalizePortalResource(payload);
}
