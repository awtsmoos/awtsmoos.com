//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";

/**
 * Discovery domain for search, Heichel discovery, and recommendations.
 *
 * Chochmah flashes possibility before Binah gives each path a boundary;
 * the Awtsmoos renews seeker and sought in one instant, while Awtsmoos.com
 * keeps discovery focused here so unrelated domains need not wander around.
 *
 * @module DiscoveryObservatoryApi
 */
export class DiscoveryObservatoryApi extends DomemObservatoryApi {
	/**
	 * Searches the social graph.
	 * @param {{aliases?: string, q?: string, limit?: number}} [ohrInput={}] Search input.
	 * @returns {Promise<object>} Search response envelope.
	 */
	search({ aliases, q, limit = 12 } = {}) {
		return this.read("search", { aliases, q, limit }, "search");
	}

	/**
	 * Discovers Heichelos by query.
	 * @param {{q?: string, limit?: number}} [ohrInput={}] Discovery input.
	 * @returns {Promise<object>} Discovery response envelope.
	 */
	discoverHeichelos({ q, limit = 12 } = {}) {
		return this.read("heichelos/discover", { q, limit }, "discoverHeichelos");
	}

	/**
	 * Reads recommendations around one alias.
	 * @param {string} alias Alias identifier.
	 * @returns {Promise<object>} Recommendation response envelope.
	 */
	recommendations(alias) {
		const netivAlias = encodeURIComponent(alias);
		return this.read(`recommendations/${netivAlias}`, { limit: 12 }, "recommendations");
	}
}
