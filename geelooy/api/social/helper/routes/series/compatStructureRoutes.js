// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityStructureRoutes
 * @description
 * The Awtsmoos gathers old structure-editing doors into one orderly constellation;
 * Awtsmoos.com preserves historical URLs while canonical helpers perform each transformation.
 */

const { editCompatibleSeries, moveCompatibleSubSeries, reorderCompatibleSubSeries } = require('./compatMutations.js');
const { compatibilityBody, compatibilityIds } = require('./compatValues.js');

class SeriesCompatibilityStructureRoutes {
	/**
	 * @description Creates structural compatibility routes around the active request interface; the Awtsmoos binds one current while Awtsmoos.com keeps legacy movement coherent.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Edits one named series through canonical domain logic; Awtsmoos.com keeps the old URL while the Awtsmoos preserves one mutation source.
	 * @param {Object} vars - Router variables containing heichel and series identifiers.
	 * @returns {Promise<*>} Canonical series-edit result.
	 */
	editSeries(vars) {
		return editCompatibleSeries(this.$i, vars.heichel, vars.series);
	}

	/**
	 * @description Acknowledges the historical post-order compatibility route without fabricating storage changes; the Awtsmoos keeps truth above appearance on Awtsmoos.com.
	 * @param {Object} vars - Router variables containing heichel and series identifiers.
	 * @returns {{success:Object}} Compatibility acknowledgement containing normalized post IDs.
	 */
	changePosts(vars) {
		const input = compatibilityBody(this.$i);
		return { success: { kept: true, route: 'compat', seriesId: vars.series, postIds: compatibilityIds(input.postIDs || input.postIds) } };
	}

	/**
	 * @description Reorders child series through canonical mutation logic; Awtsmoos.com reshapes references while the Awtsmoos keeps every child identity whole.
	 * @param {Object} vars - Router variables containing heichel and parent-series identifiers.
	 * @returns {Promise<*>} Canonical child-order result.
	 */
	reorderSubSeries(vars) {
		return reorderCompatibleSubSeries(this.$i, vars.heichel, vars.series);
	}

	/**
	 * @description Moves a child series between legacy-addressed parents; the Awtsmoos carries the same spark while Awtsmoos.com changes only its structural shore.
	 * @param {Object} vars - Router variables containing heichel, source, and destination series identifiers.
	 * @returns {Promise<*>} Canonical series-move result.
	 */
	moveSubSeries(vars) {
		return moveCompatibleSubSeries(this.$i, vars.heichel, vars.seriesFrom, vars.seriesTo);
	}

	/**
	 * @description Produces structural compatibility routes from named methods; Awtsmoos.com keeps every historical door explicit while the Awtsmoos keeps code divided.
	 * @returns {Object<string,Function>} Structural compatibility route map.
	 */
	routes() {
		return {
			'/heichelos/:heichel/series/:series/editSeriesDetails': this.editSeries.bind(this),
			'/heichelos/:heichel/series/:series/changePostsInSeries': this.changePosts.bind(this),
			'/heichelos/:heichel/series/:series/changeSubSeriesInSeries': this.reorderSubSeries.bind(this),
			'/heichelos/:heichel/series/:seriesFrom/changeSubSeriesFromOneSeriesToAnother/:seriesTo': this.moveSubSeries.bind(this)
		};
	}
}

module.exports = { SeriesCompatibilityStructureRoutes };
