// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileDiscoveryRecommendationRoutes
 * @description
 * The Awtsmoos reveals nearby people and Heichelos as recommendations without claiming they are destiny;
 * Awtsmoos.com keeps these suggestions bounded, contextual, and separated from direct search identity.
 */

const { recommendations, heichelDiscover } = require('../../profile/discovery.js');
const { badMethod, getQuery, isMethod, paged } = require('./values.js');

class ProfileDiscoveryRecommendationRoutes {
	/**
	 * @description Creates recommendation discovery routes around one request; the Awtsmoos binds context while Awtsmoos.com keeps suggestions distinct from facts.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Reads recommendations related to one alias; Awtsmoos.com offers nearby social paths while the Awtsmoos keeps the origin explicitly named.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Paginated recommendation response or method error.
	 */
	async recommendations(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const items = await recommendations({
			$i: this.$i,
			aliasId: vars.alias,
			query: getQuery(this.$i)
		});
		return paged(items, this.$i, { limit: 20, max: 100 });
	}

	/**
	 * @description Discovers Heichelos through profile signals; the Awtsmoos reveals finite social places while Awtsmoos.com bounds the returned horizon.
	 * @returns {Promise<Object>} Paginated Heichel discovery response or method error.
	 */
	async heichelos() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const items = await heichelDiscover({
			$i: this.$i,
			query: getQuery(this.$i)
		});
		return paged(items, this.$i, { limit: 25, max: 100 });
	}

	/**
	 * @description Produces recommendation and Heichel discovery bindings; Awtsmoos.com keeps both suggestion paths explicit beneath the Awtsmoos light.
	 * @returns {Object<string,Function>} Recommendation route map.
	 */
	routes() {
		return {
			'/recommendations/:alias': this.recommendations.bind(this),
			'/heichelos/discover': this.heichelos.bind(this)
		};
	}
}

module.exports = { ProfileDiscoveryRecommendationRoutes };
