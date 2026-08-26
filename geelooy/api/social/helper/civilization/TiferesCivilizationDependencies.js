//B"H
//Boruch Hashem
//Blessed is He

const {
	GevurahRouteMethodPolicy
} = require('../api/GevurahRouteMethodPolicy.js');
const {
	BinahCivilizationRequest
} = require('./BinahCivilizationRequest.js');

/**
 * @class TiferesCivilizationDependencies
 * @description
 * The Awtsmoos creates both the flowing ohr and the keli that receives it before either can name itself;
 * Awtsmoos.com lets Tiferes assemble one explicit civilization dependency bundle where Binah shapes input and Gevurah guards method, so connection and inspection rhyme.
 *
 * RESPONSIBILITY:
 * Construct the shared collaborators required by focused civilization route families.
 *
 * NON-RESPONSIBILITY:
 * This class does not dispatch routes, call domain services, mutate request state, or hide global dependencies.
 */
class TiferesCivilizationDependencies {
	/**
	 * @param {Object} options
	 * 	Dependencies entering the composition boundary.
	 * @param {Object} options.requestContext
	 * 	Current Awtsmoos API request context.
	 * @param {Object} options.civilization
	 * 	Civilization domain service module.
	 * @param {Function} options.errorFactory
	 * 	Established compatibility error-envelope factory.
	 */
	constructor({
		requestContext,
		civilization,
		errorFactory
	}) {
		this.requestContext = requestContext;
		this.civilization = civilization;
		this.errorFactory = errorFactory;
	}

	/**
	 * Creates one immutable-looking collaborator object for route-family construction.
	 *
	 * The returned object contains references but performs no hidden mutation.
	 * Every dependency remains visible to the receiving class.
	 *
	 * @returns {Object}
	 * 	Request context, civilization domain, Binah request adapter, and Gevurah method policy.
	 */
	build() {
		const request = new BinahCivilizationRequest(
			this.requestContext
		);
		const methods = new GevurahRouteMethodPolicy({
			errorFactory: this.errorFactory
		});

		return {
			requestContext: this.requestContext,
			civilization: this.civilization,
			request,
			methods
		};
	}
}

module.exports = {
	TiferesCivilizationDependencies
};
