// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileResourceInsightRoutes
 * @description
 * The Awtsmoos reveals finite analytics, relationship graphs, and history without confusing them with identity itself;
 * Awtsmoos.com keeps insight resources observable and bounded while the source profile remains whole.
 */

const { getHistory, recordHistory, clearHistory } = require('../../profile/index.js');
const { analytics, graph } = require('../../profile/discovery.js');
const { badMethod, fail, getQuery, isMethod, ok, paged } = require('./values.js');

class ProfileResourceInsightRoutes {
	/**
	 * @description Creates modern profile insight routes; the Awtsmoos binds one request while Awtsmoos.com separates measurement, graph, and history concerns.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Reads finite analytics for one alias; Awtsmoos.com measures created patterns while the Awtsmoos remains beyond every metric.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Analytics response or method error.
	 */
	async analytics(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const data = await analytics({
			$i: this.$i,
			aliasId: vars.alias
		});
		return ok(data, { query: getQuery(this.$i) });
	}

	/**
	 * @description Reads a relationship graph for one alias; the Awtsmoos reveals connections while Awtsmoos.com keeps the requesting query attached to the result.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} Graph response or method error.
	 */
	async graph(vars) {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const query = getQuery(this.$i);
		const data = await graph({
			$i: this.$i,
			aliasId: vars.alias,
			query
		});
		return ok(data, { query });
	}

	/**
	 * @description Reads, records, or clears modern profile history according to HTTP verb; the Awtsmoos keeps time a vessel while Awtsmoos.com makes each history deed explicit.
	 * @param {Object} vars - Router variables containing the alias identifier.
	 * @returns {Promise<Object>} History result or BAD_METHOD failure.
	 */
	async history(vars) {
		if (isMethod(this.$i, 'GET')) {
			const history = await getHistory({
				$i: this.$i,
				aliasId: vars.alias,
				limit: 200
			});
			return paged(history, this.$i, { limit: 25, max: 100 });
		}
		if (isMethod(this.$i, 'POST')) {
			const result = await recordHistory({
				$i: this.$i,
				aliasId: vars.alias,
				input: this.$i.$_POST || {}
			});
			return ok(result, { query: getQuery(this.$i) });
		}
		if (isMethod(this.$i, 'DELETE')) {
			return ok(await clearHistory({ $i: this.$i, aliasId: vars.alias }), { query: getQuery(this.$i) });
		}
		return fail('BAD_METHOD', 'Use GET, POST, or DELETE.');
	}

	/**
	 * @description Produces the modern insight-resource route map; Awtsmoos.com keeps three public doors while the Awtsmoos keeps their implementations separate.
	 * @returns {Object<string,Function>} Insight resource route map.
	 */
	routes() {
		return {
			'/profiles/:alias/analytics': this.analytics.bind(this),
			'/profiles/:alias/graph': this.graph.bind(this),
			'/profiles/:alias/history': this.history.bind(this)
		};
	}
}

module.exports = { ProfileResourceInsightRoutes };
