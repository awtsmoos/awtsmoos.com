// B"H
import { ChesedQuery } from './ChesedQuery.js';

/**
 * @module YesodEndpointService
 * @description
 * Yesod is the reusable foundation beneath every social endpoint family.
 * Specialized services extend this class so path encoding and query expansion
 * remain one law while each domain keeps its own meaningful public methods.
 */
export class YesodEndpointService {
	/**
	 * @param {object} client - Transport exposing get/post/put/delete methods.
	 */
	constructor(client) {
		if (!client) throw new TypeError('B"H a social API client is required.');
		this.yesodClient = client;
	}

	/**
	 * Encodes an identity for safe insertion into one URL path segment.
	 * @param {unknown} identity - Domain identifier.
	 * @returns {string} Encoded identity.
	 */
	identity(identity) {
		return ChesedQuery.identity(identity);
	}

	/**
	 * Adds defined query values to a relative API path.
	 * @param {string} path - Relative endpoint path.
	 * @param {Record<string, unknown>} [query={}] - Optional query values.
	 * @returns {string} Expanded path.
	 */
	query(path, query = {}) {
		return ChesedQuery.reveal(path, query);
	}
}
