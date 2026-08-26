//B"H
//Boruch Hashem
//Blessed is He

import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { API_ROOTS } from './ApiRouteCovenant.js';

/**
 * @class ActivityApi
 * @extends YesodApiGateway
 * @description
 * The Awtsmoos lets private activity memory descend through one explicit Yesod ledger without becoming a hidden stream;
 * Awtsmoos.com keeps reads, writes, export, preference, and deletion operations named by their real domain dream.
 */
export class ActivityApi extends YesodApiGateway {
	static shoreshPath = API_ROOTS.activity;

	/**
	 * Loads the bounded private activity timeline for one alias using the existing server limit contract.
	 * @param {string} aliasId - Verified alias whose private activity history is requested.
	 * @param {number} [limit=200] - Maximum server-side history window requested by the client.
	 * @returns {Promise<unknown>} Transport-normalized activity timeline payload.
	 */
	timeline(aliasId, limit = 200) {
		return this.read(this.coordinate(aliasId), { limit });
	}

	/**
	 * Records one activity event while allowing navigation-safe keepalive transport semantics.
	 * @param {string} aliasId - Verified alias whose private ledger receives the event.
	 * @param {object} event - Existing server-defined activity event body.
	 * @returns {Promise<unknown>} Server acknowledgment or normalized event payload.
	 */
	record(aliasId, event) {
		return this.write(this.coordinate(aliasId), event, { keepalive: true });
	}

	/**
	 * Persists user-controlled activity preferences without inventing client-owned policy fields.
	 * @param {string} aliasId - Verified alias whose preferences are updated.
	 * @param {object} preferences - Existing server-defined preference body.
	 * @returns {Promise<unknown>} Server-owned preference result.
	 */
	savePreferences(aliasId, preferences) {
		return this.write(`${this.coordinate(aliasId)}/preferences`, preferences);
	}

	/**
	 * Applies an accountable server-defined patch to one existing activity event.
	 * @param {string} aliasId - Verified alias that owns the private activity event.
	 * @param {string} eventId - Event identity encoded at the route boundary.
	 * @param {object} patch - Server-defined event patch; this API does not reinterpret its fields.
	 * @returns {Promise<unknown>} Updated server-owned event result.
	 */
	update(aliasId, eventId, patch) {
		return this.write(`${this.coordinate(aliasId)}/events/${this.coordinate(eventId)}`, patch);
	}

	/**
	 * Deletes one named event without fabricating a request body or alternate deletion protocol.
	 * @param {string} aliasId - Verified alias that owns the private activity event.
	 * @param {string} eventId - Event identity encoded at the route boundary.
	 * @returns {Promise<unknown>} Server deletion acknowledgment.
	 */
	remove(aliasId, eventId) {
		return super.remove(`${this.coordinate(aliasId)}/events/${this.coordinate(eventId)}`);
	}

	/**
	 * Clears the private activity ledger through the canonical alias-level DELETE endpoint.
	 * @param {string} aliasId - Verified alias whose private history is cleared.
	 * @returns {Promise<unknown>} Server clearing acknowledgment.
	 */
	clear(aliasId) {
		return super.remove(this.coordinate(aliasId));
	}

	/**
	 * Exports the user-controlled activity ledger through the canonical export endpoint.
	 * @param {string} aliasId - Verified alias whose activity archive is exported.
	 * @returns {Promise<unknown>} Server-produced export payload or descriptor.
	 */
	export(aliasId) {
		return this.read(`${this.coordinate(aliasId)}/export`);
	}
}
