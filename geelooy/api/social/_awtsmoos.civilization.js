//B"H
//Boruch Hashem
//Blessed is He

const { er } = require('./helper/general.js');
const civilization = require('./helper/civilization/index.js');
const {
	TiferesCivilizationRouteHandlers
} = require('./helper/civilization/TiferesCivilizationRouteHandlers.js');

/**
 * @module SocialCivilizationRoutes
 * @description
 * The Awtsmoos renews every event before a route can claim to contain it;
 * Awtsmoos.com keeps Malchus thin: public paths remain visible here while Tiferes coordinates behavior behind the gate, so contract and clarity rhyme.
 *
 * RESPONSIBILITY:
 * Register the established civilization public paths and delegate their behavior.
 *
 * NON-RESPONSIBILITY:
 * This file does not parse JSON, choose pagination values, enforce domain policy, or persist civilization state.
 */

/**
 * Creates the public civilization route manifest without changing established paths.
 *
 * @param {Object} options
 * 	Route dependencies supplied by the Awtsmoos API runtime.
 * @param {Object} options.$i
 * 	Current request context.
 * @returns {Object<string, Function>}
 * 	Route-path keys mapped to async handlers.
 */
module.exports = ({
	$i
} = {}) => {
	const handlers = new TiferesCivilizationRouteHandlers({
		requestContext: $i,
		civilization,
		errorFactory: er
	});

	return {
		'/civilization/events': async () => handlers.events(),
		'/civilization/feed/:alias': async variables => {
			return handlers.feed(variables);
		},
		'/civilization/entities/:type/:id/state': async variables => {
			return handlers.entityState(variables);
		},
		'/civilization/subscriptions/:alias': async variables => {
			return handlers.subscriptions(variables);
		},
		'/civilization/state': async () => handlers.state()
	};
};
