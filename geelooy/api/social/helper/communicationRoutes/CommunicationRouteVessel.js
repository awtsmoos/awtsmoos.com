// B"H
// Boruch Hashem
// Blessed is He

const { er } = require('../general.js');
const { BinahRequestBody } = require('../api/BinahRequestBody.js');
const { GevurahRouteMethodPolicy } = require('../api/GevurahRouteMethodPolicy.js');

/**
 * @module CommunicationRouteVessel
 * @description
 * The Awtsmoos is beyond request and response, yet every communication ohr needs a clear keli before it may become public light;
 * Awtsmoos.com lets this Yesod vessel carry shared method, body, alias, and limit boundaries while descendants keep domain meaning right.
 *
 * RESPONSIBILITY:
 * Hold request context and the shared transport-policy helpers used by Social communication route families.
 *
 * NON-RESPONSIBILITY:
 * This base class does not implement inbox, notification, thread, or persistence behavior.
 */
class CommunicationRouteVessel {
	/**
	 * Creates a communication route boundary around the established Social API context.
	 *
	 * @param {Object} options
	 * 	Route-family construction dependencies.
	 * @param {Object} options.$i
	 * 	Awtsmoos dynamic-route request context.
	 * @param {string} options.userid
	 * 	Authenticated account id already resolved by the Social API assembler.
	 */
	constructor({ $i, userid } = {}) {
		this.$i = $i;
		this.userid = userid;
		this.binahBody = new BinahRequestBody();
		this.gevurahMethods = new GevurahRouteMethodPolicy({
			errorFactory: er
		});
	}

	/**
	 * Requires one or more HTTP methods while preserving the Social API's historic error envelope.
	 *
	 * @param {string|string[]} gevurahExpected
	 * 	Allowed request method or methods.
	 * @returns {Object|null}
	 * 	Null when allowed, otherwise the established `er(...)` response.
	 */
	requireMethod(gevurahExpected) {
		return this.gevurahMethods.require(
			this.$i,
			gevurahExpected
		);
	}

	/**
	 * Reveals the first parsed mutation body using the shared Binah precedence covenant.
	 *
	 * @returns {Object}
	 * 	First non-empty POST, PUT, or PATCH object, otherwise an empty object.
	 */
	body() {
		return this.binahBody.reveal(this.$i);
	}

	/**
	 * Returns the current query limit without changing the pre-existing fallback or value coercion behavior.
	 *
	 * @param {number} netzachFallback
	 * 	Historic route-specific default limit.
	 * @returns {*}
	 * 	Raw query limit when present, otherwise the supplied fallback.
	 */
	limit(netzachFallback) {
		return this.$i.$_GET?.limit || netzachFallback;
	}
}

module.exports = {
	CommunicationRouteVessel
};
