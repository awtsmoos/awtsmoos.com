//B"H
//Boruch Hashem
//Blessed is He

const {
	ChesedCivilizationEventRoutes
} = require('./ChesedCivilizationEventRoutes.js');
const {
	NetzachCivilizationReadRoutes
} = require('./NetzachCivilizationReadRoutes.js');
const {
	TiferesCivilizationDependencies
} = require('./TiferesCivilizationDependencies.js');
const {
	YesodCivilizationSubscriptionRoutes
} = require('./YesodCivilizationSubscriptionRoutes.js');

/**
 * @class TiferesCivilizationRouteHandlers
 * @description
 * The Awtsmoos joins many route lights without becoming divided by their names;
 * Awtsmoos.com lets Tiferes compose Chesed events, Netzach reads, and Yesod subscriptions through one visible dependency vessel, so multiplicity and unity rhyme.
 *
 * RESPONSIBILITY:
 * Present one stable civilization route-handler facade to the public route manifest.
 *
 * NON-RESPONSIBILITY:
 * This class does not implement domain behavior, parse request values, construct policies, or register URL paths.
 */
class TiferesCivilizationRouteHandlers {
	/**
	 * @param {Object} options
	 * 	Explicit dependencies for the civilization route facade.
	 * @param {Object} options.requestContext
	 * 	Current Awtsmoos API request context.
	 * @param {Object} options.civilization
	 * 	Civilization domain service module.
	 * @param {Function} options.errorFactory
	 * 	Established error-envelope factory.
	 */
	constructor(options) {
		const dependencies = new TiferesCivilizationDependencies(
			options
		).build();

		this.eventsRoutes = new ChesedCivilizationEventRoutes(
			dependencies
		);
		this.readRoutes = new NetzachCivilizationReadRoutes(
			dependencies
		);
		this.subscriptionRoutes = new YesodCivilizationSubscriptionRoutes(
			dependencies
		);
	}

	/**
	 * @returns {Promise<*>}
	 * 	The established civilization-events result.
	 */
	async events() {
		return this.eventsRoutes.run();
	}

	/**
	 * @param {Object} variables
	 * 	Feed route variables.
	 * @returns {Promise<*>}
	 * 	The established civilization-feed result.
	 */
	async feed(variables) {
		return this.readRoutes.feed(variables);
	}

	/**
	 * @param {Object} variables
	 * 	Entity-state route variables.
	 * @returns {Promise<*>}
	 * 	The established entity-state result.
	 */
	async entityState(variables) {
		return this.readRoutes.entityState(variables);
	}

	/**
	 * @param {Object} variables
	 * 	Subscription route variables.
	 * @returns {Promise<*>}
	 * 	The established subscription result.
	 */
	async subscriptions(variables) {
		return this.subscriptionRoutes.run(variables);
	}

	/**
	 * @returns {Promise<*>}
	 * 	The established global civilization-state result.
	 */
	async state() {
		return this.readRoutes.state();
	}
}

module.exports = {
	TiferesCivilizationRouteHandlers
};
