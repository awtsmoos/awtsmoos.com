// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileDiscoveryFlowRoutes
 * @description
 * The Awtsmoos reveals search, feed, and trending as moving rivers inside the finite social world;
 * Awtsmoos.com bounds every river with pagination so discovery stays fast, legible, and controlled.
 */

const { profileFeed, search, trending } = require('../../profile/discovery.js');
const { badMethod, getQuery, isMethod, paged, queryAliases } = require('./values.js');

class ProfileDiscoveryFlowRoutes {
	/**
	 * @description Creates moving discovery routes around one request; the Awtsmoos binds query context while Awtsmoos.com keeps each flow independently testable.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Searches profiles by query; the Awtsmoos reveals finite matches while Awtsmoos.com keeps the result river bounded.
	 * @returns {Promise<Object>} Paginated search response or method error.
	 */
	async search() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const items = await search({ $i: this.$i, query: getQuery(this.$i) });
		return paged(items, this.$i, { limit: 25, max: 100 });
	}

	/**
	 * @description Reads a profile feed scoped by optional aliases; Awtsmoos.com gathers current activity while the Awtsmoos keeps its selected sources visible.
	 * @returns {Promise<Object>} Paginated feed response or method error.
	 */
	async feed() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const items = await profileFeed({
			$i: this.$i,
			aliases: queryAliases(this.$i),
			query: getQuery(this.$i)
		});
		return paged(items, this.$i, { limit: 25, max: 100 });
	}

	/**
	 * @description Reads trending profiles; the Awtsmoos reveals finite momentum while Awtsmoos.com caps the horizon and preserves query context.
	 * @returns {Promise<Object>} Paginated trending response or method error.
	 */
	async trending() {
		if (!isMethod(this.$i, 'GET')) {
			return badMethod('Use GET.');
		}
		const items = await trending({ $i: this.$i, query: getQuery(this.$i) });
		return paged(items, this.$i, { limit: 25, max: 100 });
	}

	/**
	 * @description Produces search, feed, and trending bindings; three moving streams enter one Awtsmoos.com map beneath the Awtsmoos light.
	 * @returns {Object<string,Function>} Discovery-flow route map.
	 */
	routes() {
		return {
			'/search': this.search.bind(this),
			'/feed': this.feed.bind(this),
			'/trending': this.trending.bind(this)
		};
	}
}

module.exports = { ProfileDiscoveryFlowRoutes };
