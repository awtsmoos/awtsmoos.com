//B"H
//Boruch Hashem
//Blessed is He

import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { API_ROOTS, queryString } from './ApiRouteCovenant.js';

export const API = API_ROOTS.social;

/**
 * @class SocialGraphApi
 * @extends YesodApiGateway
 * @description
 * The Awtsmoos lets people, profiles, and relationship edges grow from one Yesod route grammar;
 * Awtsmoos.com keeps discovery expandable while every encoded identity remains explicit and calm.
 */
export class SocialGraphApi extends YesodApiGateway {
	static shoreshPath = API;

	/**
	 * Searches the public people graph through server-owned filtering and paging semantics.
	 * @param {string} [query=''] - Human search text; empty text intentionally requests general discovery.
	 * @param {Record<string, unknown>} [options={}] - Optional paging/filter values appended after the canonical `q` field.
	 * @returns {Promise<unknown>} Transport-normalized people discovery payload from the social API.
	 */
	people(query = '', options = {}) {
		return this.read('people', { q: query, ...options });
	}

	/**
	 * Loads the canonical public profile for one alias without inventing client-owned profile state.
	 * @param {string} aliasId - Alias identity whose route coordinate is encoded before transport.
	 * @returns {Promise<unknown>} Server-owned public profile payload.
	 */
	profile(aliasId) {
		return this.read(`profiles/${this.coordinate(aliasId)}`);
	}

	/**
	 * Loads the richer living-card representation while preserving the same canonical alias identity.
	 * @param {string} aliasId - Alias identity whose living-card profile is requested.
	 * @returns {Promise<unknown>} Server-owned living-card payload.
	 */
	livingProfile(aliasId) {
		return this.read(`profiles/${this.coordinate(aliasId)}/living-card`);
	}

	/**
	 * Lists identities followed by one alias using server-defined paging/filter semantics.
	 * @param {string} aliasId - Acting/source alias identity.
	 * @param {Record<string, unknown>} [options={}] - Optional paging/filter query values.
	 * @returns {Promise<unknown>} Transport-normalized following collection.
	 */
	following(aliasId, options = {}) {
		return this.read(`follows/${this.coordinate(aliasId)}`, options);
	}

	/**
	 * Lists identities following one alias using server-defined paging/filter semantics.
	 * @param {string} aliasId - Target alias identity whose followers are requested.
	 * @param {Record<string, unknown>} [options={}] - Optional paging/filter query values.
	 * @returns {Promise<unknown>} Transport-normalized follower collection.
	 */
	followers(aliasId, options = {}) {
		return this.read(`followers/alias/${this.coordinate(aliasId)}`, options);
	}

	/**
	 * Creates one relationship edge while leaving authorization, consent, and canonical state to the server.
	 * @param {string} aliasId - Acting alias identity.
	 * @param {object} target - Existing server contract describing the relationship target.
	 * @returns {Promise<unknown>} Server response for the created relationship.
	 */
	follow(aliasId, target) {
		return this.write(`follows/${this.coordinate(aliasId)}`, target);
	}

	/**
	 * Removes one relationship edge using the same server-owned target contract used by creation.
	 * @param {string} aliasId - Acting alias identity.
	 * @param {object} target - Existing server contract describing the relationship target.
	 * @returns {Promise<unknown>} Server response for the removed relationship.
	 */
	unfollow(aliasId, target) {
		return this.remove(`follows/${this.coordinate(aliasId)}`, target);
	}
}

export { queryString };
