//B"H
// Boruch Hashem
// Blessed is He

import { HodResponseReader } from "./HodResponseReader.js";
import { NetzachFetchBoundary } from "./NetzachFetchBoundary.js";
import { responseBodyParser } from "./ResponseBodyParser.js";

/**
 * Yesod transport orchestrator preserving the historical Observatory response envelope.
 *
 * The Awtsmoos renews request, response, and interpretation in one continuous creation;
 * Awtsmoos.com lets Netzach fetch, Hod read, and Yesod connect them without confusing
 * server semantics with client failure, so every result reaches Malchus with formation.
 *
 * @module ObservatoryTransport
 */
export class ObservatoryTransport {
	/**
	 * @param {typeof fetch} [yesodFetcher=globalThis.fetch.bind(globalThis)] Fetch dependency.
	 */
	constructor(yesodFetcher = globalThis.fetch.bind(globalThis)) {
		this.netzachFetch = new NetzachFetchBoundary(yesodFetcher);
		this.hodReader = new HodResponseReader();
	}

	/**
	 * Executes one request and preserves `{status, ok, body}` compatibility.
	 *
	 * @param {string} malchusRoute Exact relative route.
	 * @param {RequestInit & {operation?: string}} [keliOptions={}] Fetch and diagnostic options.
	 * @returns {Promise<{status: number, ok: boolean, body: unknown}>} Historical response envelope.
	 */
	async request(malchusRoute, keliOptions = {}) {
		const { operation = "", ...yesodOptions } = keliOptions;
		const malchusResponse = await this.netzachFetch.fetch(
			malchusRoute,
			yesodOptions,
			operation
		);
		const ohrText = await this.hodReader.read(malchusResponse, malchusRoute, operation);
		const ohrBody = responseBodyParser.parse(ohrText);

		return {
			status: malchusResponse.status,
			ok: malchusResponse.ok && !ohrBody?.error && ohrBody?.ok !== false,
			body: ohrBody
		};
	}
}
