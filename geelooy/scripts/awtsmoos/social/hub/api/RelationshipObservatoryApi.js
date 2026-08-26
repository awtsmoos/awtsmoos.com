//B"H
// Boruch Hashem
// Blessed is He

import { DomemObservatoryApi } from "./DomemObservatoryApi.js";
import { queryKeli } from "./QueryKeli.js";
import { socialRoute } from "./ApiCovenant.js";

/**
 * Relationship domain for following state and deliberate follow mutations.
 *
 * Chesed reaches outward, Gevurah declares exactly whom and how; the Awtsmoos
 * renews both parties before a relation can appear, and Awtsmoos.com keeps that
 * bond explicit so graph observation never disguises a state-changing vow.
 *
 * @module RelationshipObservatoryApi
 */
export class RelationshipObservatoryApi extends DomemObservatoryApi {
	/** @param {string} alias Alias identifier. @returns {Promise<object>} Following envelope. */
	follows(alias) {
		return this.read(`follows/${encodeURIComponent(alias)}`, { limit: 50 }, "follows");
	}

	/** @param {string} alias Alias identifier. @returns {Promise<object>} Followers envelope. */
	followers(alias) {
		return this.read(`followers/alias/${encodeURIComponent(alias)}`, { limit: 50 }, "followers");
	}

	/**
	 * Creates or changes one follow relationship through the historical query mutation route.
	 * @param {{alias: string, type: string, id: string}} ohrInput Explicit relationship input.
	 * @returns {Promise<object>} Mutation response envelope.
	 */
	follow({ alias, type, id }) {
		const netivAlias = encodeURIComponent(alias);
		const malchusRoute = `${socialRoute(`follows/${netivAlias}`)}${queryKeli.build({ type, id })}`;

		return this.transport.request(malchusRoute, {
			method: "POST",
			operation: "follow"
		});
	}
}
