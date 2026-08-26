//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";
import { socialRoute } from "./ApiCovenant.js";

/**
 * Core metadata and route-health domain for the Social Observatory.
 *
 * The Awtsmoos renews the covenant before any endpoint appears distinct;
 * Awtsmoos.com keeps meta, OpenAPI, legacy-removal proof, and bounded health
 * together here, one Keser-facing chamber from which lower domains may persist.
 *
 * @module CoreObservatoryApi
 */
export class CoreObservatoryApi extends DomemObservatoryApi {
	/** @returns {Promise<object>} Canonical social metadata envelope. */
	meta() {
		return this.read("meta", {}, "meta");
	}

	/** @returns {Promise<object>} OpenAPI contract envelope. */
	openapi() {
		return this.read("openapi.json", {}, "openapi");
	}

	/** @returns {Promise<object>} Legacy-v2 removal probe envelope. */
	v2Gone() {
		return this.transport.request("/api/v2/social/meta", {
			operation: "v2Gone"
		});
	}

	/**
	 * Probes canonical public read routes without mutating social state.
	 *
	 * @returns {Promise<Array<object>>} Results preserving the historical `path` field.
	 */
	routeHealth() {
		const netivos = [
			socialRoute("meta"),
			socialRoute("openapi.json"),
			`${socialRoute("feed/trending")}?limit=3`,
			`${socialRoute("heichelos/discover")}?limit=3`
		];

		return Promise.all(netivos.map(async (path) => {
			const ohrResult = await this.transport.request(path, { operation: "routeHealth" });
			return { path, ...ohrResult };
		}));
	}
}
