//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ChesedCivilizationEventRoutes
 * @description
 * The Awtsmoos renews every event before history can claim it as its own;
 * Awtsmoos.com lets Chesed expand one route into truthful reading or recording while Gevurah still guards the gate, so old memory and new motion rhyme.
 *
 * RESPONSIBILITY:
 * Coordinate GET and POST behavior for the established `/civilization/events` route.
 *
 * NON-RESPONSIBILITY:
 * This class does not register paths, decode raw JSON itself, persist events, or define response envelopes.
 */
class ChesedCivilizationEventRoutes {
	/**
	 * @param {Object} options
	 * 	Explicit collaborators for the events route.
	 * @param {Object} options.requestContext
	 * 	Current Awtsmoos API request context.
	 * @param {Object} options.civilization
	 * 	Civilization domain service.
	 * @param {Object} options.request
	 * 	Binah request adapter.
	 * @param {Object} options.methods
	 * 	Gevurah method policy.
	 */
	constructor({
		requestContext,
		civilization,
		request,
		methods
	}) {
		this.requestContext = requestContext;
		this.civilization = civilization;
		this.request = request;
		this.methods = methods;
	}

	/**
	 * Manifests the existing GET-list or POST-record contract.
	 *
	 * @returns {Promise<*>}
	 * 	The untouched civilization domain result or BAD_METHOD compatibility envelope.
	 */
	async run() {
		if (this.methods.is(this.requestContext, 'POST')) {
			return this.record();
		}

		if (this.methods.is(this.requestContext, 'GET')) {
			return this.list();
		}

		return this.methods.require(
			this.requestContext,
			['GET', 'POST']
		);
	}

	/**
	 * @returns {Promise<*>}
	 * 	The result of recording one decoded civilization event.
	 */
	async record() {
		return this.civilization.recordCivilizationEvent({
			$i: this.requestContext,
			input: this.request.event()
		});
	}

	/**
	 * @returns {Promise<*>}
	 * 	The result of listing civilization events with the historic limit contract.
	 */
	async list() {
		return this.civilization.listCivilizationEvents({
			$i: this.requestContext,
			query: this.request.query(),
			limit: this.request.limit()
		});
	}
}

module.exports = {
	ChesedCivilizationEventRoutes
};
