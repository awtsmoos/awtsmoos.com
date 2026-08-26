//B"H
//Boruch Hashem
//Blessed is He

const {
	BinahRequestValueDecoder
} = require('../api/BinahRequestValueDecoder.js');

/**
 * @class BinahCivilizationRequest
 * @description
 * The Awtsmoos renews a civilization event before GET and POST can divide its appearance;
 * Awtsmoos.com lets Binah shape transport values into the exact domain arguments the civilization service already understands, so old roads and new order rhyme.
 *
 * RESPONSIBILITY:
 * Translate the existing `$i` request representation into explicit civilization-domain arguments.
 *
 * NON-RESPONSIBILITY:
 * This adapter does not choose methods, call domain services, or create response envelopes.
 */
class BinahCivilizationRequest {
	/**
	 * @param {Object} requestContext
	 * 	The current Awtsmoos route context.
	 * @param {BinahRequestValueDecoder} [decoder]
	 * 	Reusable compatibility decoder.
	 */
	constructor(
		requestContext,
		decoder = new BinahRequestValueDecoder()
	) {
		this.requestContext = requestContext || {};
		this.decoder = decoder;
	}

	/**
	 * @returns {Object}
	 * 	Query and body fields merged with body precedence.
	 */
	input() {
		return this.decoder.merge(
			this.requestContext.$_GET || {},
			this.requestContext.$_POST || {}
		);
	}

	/**
	 * @returns {Object}
	 * 	The event payload with historically JSON-encoded nested fields decoded.
	 */
	event() {
		const body = this.requestContext.$_POST || {};

		return {
			...body,
			actor: this.decoder.json(body.actor),
			target: this.decoder.json(body.target),
			payload: this.decoder.json(body.payload),
			context: this.decoder.json(body.context),
			targetAliases: this.decoder.json(
				body.targetAliases,
				[]
			)
		};
	}

	/**
	 * @returns {Object}
	 * 	The canonical civilization event-filter arguments.
	 */
	query() {
		const body = this.input();

		return {
			type: body.type || '',
			actorAliasId: body.actorAliasId || '',
			targetAliasId: body.targetAliasId || '',
			targetType: body.targetType || '',
			targetId: body.targetId || '',
			since: body.since || 0
		};
	}

	/**
	 * @param {number} [fallback=100]
	 * 	Historic default used when no GET limit is supplied.
	 * @returns {number}
	 * 	The compatibility Number conversion of the GET limit.
	 */
	limit(fallback = 100) {
		return this.decoder.number(
			this.requestContext.$_GET?.limit,
			fallback
		);
	}

	/**
	 * @returns {*}
	 * 	Decoded subscription options, defaulting to an empty object.
	 */
	subscriptionOptions() {
		return this.decoder.json(
			this.requestContext.$_POST?.options
		);
	}
}

module.exports = {
	BinahCivilizationRequest
};
