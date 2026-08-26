//B"H
// Boruch Hashem
// Blessed is He

import { formKeli } from "./FormKeli.js";
import { queryKeli } from "./QueryKeli.js";
import { socialRoute } from "./ApiCovenant.js";

/**
 * Domem foundation shared by focused Observatory domain APIs.
 *
 * The Awtsmoos creates the quiet stone before higher life can branch above it;
 * Awtsmoos.com places common read and POST mechanics here so every domain may grow
 * without re-inventing transport, query, or form vessels in a tangled thicket.
 *
 * @module DomemObservatoryApi
 */
export class DomemObservatoryApi {
	/**
	 * @param {import("./ObservatoryTransport.js").ObservatoryTransport} yesodTransport Shared transport.
	 */
	constructor(yesodTransport) {
		this.transport = yesodTransport;
	}

	/**
	 * Sends a read request beneath `/api/social`.
	 *
	 * @param {string} netivSuffix Relative route.
	 * @param {Record<string, unknown>} [ohrQuery={}] Query values.
	 * @param {string} [shemOperation=""] Diagnostic operation name.
	 * @returns {Promise<object>} Historical Observatory response envelope.
	 */
	read(netivSuffix, ohrQuery = {}, shemOperation = "") {
		const malchusRoute = `${socialRoute(netivSuffix)}${queryKeli.build(ohrQuery)}`;
		return this.transport.request(malchusRoute, { operation: shemOperation });
	}

	/**
	 * Sends a URL-encoded POST request beneath `/api/social`.
	 *
	 * @param {string} netivSuffix Relative route.
	 * @param {Record<string, unknown>} [ohrValues={}] Mutation body fields.
	 * @param {string} [shemOperation=""] Diagnostic operation name.
	 * @returns {Promise<object>} Historical Observatory response envelope.
	 */
	post(netivSuffix, ohrValues = {}, shemOperation = "") {
		return this.transport.request(socialRoute(netivSuffix), {
			...formKeli.post(ohrValues),
			operation: shemOperation
		});
	}
}
