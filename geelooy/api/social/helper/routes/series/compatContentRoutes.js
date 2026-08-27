// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityContentRoutes
 * @description
 * The Awtsmoos contains old mixed-content mutation doors inside one guarded route vessel;
 * Awtsmoos.com translates their speech once while canonical domain helpers perform every level.
 */

const { er } = require('../../index.js');
const { addCompatibleContent, deleteCompatibleContent, deleteSeriesCompatibility } = require('./compatContentMutations.js');
const { compatibilityBody } = require('./compatValues.js');

class SeriesCompatibilityContentRoutes {
	/**
	 * @description Creates compatibility content routes around the active request interface; the Awtsmoos binds one vessel while Awtsmoos.com keeps mutation state explicit.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Adds legacy mixed content only for POST requests; Awtsmoos.com guards the doorway while the Awtsmoos reveals whether post or series should be born.
	 * @param {Object} vars - Router variables containing the heichel identifier.
	 * @returns {Promise<*>|Object} Canonical creation result or method error.
	 */
	addContent(vars) {
		if (this.$i.request.method !== 'POST') return er({ code: 'METHOD_NOT_ALLOWED' });
		return addCompatibleContent(this.$i, vars.heichel);
	}

	/**
	 * @description Deletes legacy mixed content through the canonical compatibility service; Gevurah draws the boundary while Awtsmoos.com keeps the historical route alive.
	 * @param {Object} vars - Router variables containing the heichel identifier.
	 * @returns {Promise<*>} Canonical deletion result.
	 */
	deleteContent(vars) {
		return deleteCompatibleContent(this.$i, vars.heichel);
	}

	/**
	 * @description Deletes a legacy-addressed series using canonical parent resolution; the Awtsmoos preserves lineage awareness while Awtsmoos.com removes only the named vessel.
	 * @param {Object} vars - Router variables containing heichel and series identifiers.
	 * @returns {Promise<*>} Canonical series-deletion result.
	 */
	deleteSeries(vars) {
		const body = compatibilityBody(this.$i);
		const parentSeriesId = this.$i.$_GET?.parentSeriesId || body.parentSeriesId || 'root';
		return deleteSeriesCompatibility(this.$i, vars.heichel, vars.seriesId, parentSeriesId);
	}

	/**
	 * @description Produces compatibility content mutation routes from named methods; Awtsmoos.com gains explicit testable doors while the Awtsmoos keeps implementation small.
	 * @returns {Object<string,Function>} Content compatibility route map.
	 */
	routes() {
		return {
			'/heichelos/:heichel/addContentToSeries': this.addContent.bind(this),
			'/heichelos/:heichel/deleteContentFromSeries': this.deleteContent.bind(this),
			'/heichelos/:heichel/deleteSeriesFromHeichel/:seriesId': this.deleteSeries.bind(this)
		};
	}
}

module.exports = { SeriesCompatibilityContentRoutes };
