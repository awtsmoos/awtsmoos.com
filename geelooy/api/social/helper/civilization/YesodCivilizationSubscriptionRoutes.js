//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class YesodCivilizationSubscriptionRoutes
 * @description
 * The Awtsmoos creates both speaker and listener before any subscription can connect them;
 * Awtsmoos.com lets Yesod carry that relationship through one explicit GET-or-POST gate while decoded options remain a bounded vessel, so connection and protection rhyme.
 *
 * RESPONSIBILITY:
 * Coordinate list and subscribe behavior for `/civilization/subscriptions/:alias`.
 *
 * NON-RESPONSIBILITY:
 * This class does not register paths, persist subscriptions directly, or define authorization policy.
 */
class YesodCivilizationSubscriptionRoutes {
	/**
	 * @param {Object} options
	 * 	Explicit collaborators for subscription routes.
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
	 * Dispatches the established GET-list or POST-subscribe contract.
	 *
	 * @param {Object} variables
	 * 	Route variables containing `alias`.
	 * @returns {Promise<*>}
	 * 	The untouched domain result or BAD_METHOD envelope.
	 */
	async run(variables) {
		if (this.methods.is(this.requestContext, 'POST')) {
			return this.subscribe(variables);
		}

		if (this.methods.is(this.requestContext, 'GET')) {
			return this.list(variables);
		}

		return this.methods.require(
			this.requestContext,
			['GET', 'POST']
		);
	}

	/**
	 * @param {Object} variables
	 * 	Route variables containing `alias`.
	 * @returns {Promise<*>}
	 * 	The established subscription mutation result.
	 */
	async subscribe(variables) {
		const body = this.requestContext.$_POST || {};

		return this.civilization.subscribeCivilization({
			$i: this.requestContext,
			aliasId: variables.alias,
			subject: body.subject || 'all',
			options: this.request.subscriptionOptions()
		});
	}

	/**
	 * @param {Object} variables
	 * 	Route variables containing `alias`.
	 * @returns {Promise<*>}
	 * 	The established subscription list result.
	 */
	async list(variables) {
		return this.civilization.listCivilizationSubscriptions({
			$i: this.requestContext,
			aliasId: variables.alias
		});
	}
}

module.exports = {
	YesodCivilizationSubscriptionRoutes
};
