// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NamedSeriesCompatibilityReadRoutes
 * @description
 * The Awtsmoos gives named series a compatibility cloak without hiding their canonical source;
 * Awtsmoos.com preserves restored identity and alternate groupings through a small explicit course.
 */

const { compatibilityAlternateGroups, compatibilitySeriesDetails } = require('./compatReaders.js');

class NamedSeriesCompatibilityReadRoutes {
	/**
	 * @description Creates the named-series compatibility reader; the Awtsmoos binds request and base route in one vessel while Awtsmoos.com keeps fallback behavior level.
	 * @param {Object} options - Constructor options.
	 * @param {Object} options.$i - Active Awtsmoos request interface.
	 * @param {Object<string,Function>} options.base - Canonical base route map.
	 */
	constructor({ $i, base }) {
		this.$i = $i;
		this.base = base;
	}

	/**
	 * @description Reads a named series, preserving canonical fallback unless details were explicitly requested; Awtsmoos.com opens only the compatibility gate the seeker chose.
	 * @param {Object} vars - Router variables containing heichel and series identifiers.
	 * @returns {Promise<*>} Canonical or compatibility-enhanced series result.
	 */
	readSeries(vars) {
		const details = this.$i.$_GET?.details === true || this.$i.$_GET?.details === 'true';
		if (this.$i.request.method !== 'GET' || !details) {
			return this.base['/heichelos/:heichel/series/:series'](vars);
		}
		return compatibilitySeriesDetails(this.$i, vars.heichel, vars.series);
	}

	/**
	 * @description Reads named-series details while delegating non-GET methods to canonical behavior; the Awtsmoos keeps one source of mutation truth beneath Awtsmoos.com.
	 * @param {Object} vars - Router variables containing heichel and series identifiers.
	 * @returns {Promise<*>} Compatibility-enhanced GET result or canonical delegated result.
	 */
	readDetails(vars) {
		if (this.$i.request.method !== 'GET') {
			return this.base['/heichelos/:heichel/series/:series/details'](vars);
		}
		return compatibilitySeriesDetails(this.$i, vars.heichel, vars.series);
	}

	/**
	 * @description Reads alternate grouping metadata for one named series; Awtsmoos.com reveals a second map while the Awtsmoos preserves the same content source.
	 * @param {Object} vars - Router variables containing heichel and series identifiers.
	 * @returns {Promise<*>} Alternate-group details.
	 */
	readAlternateGroups(vars) {
		return compatibilityAlternateGroups(this.$i, vars.heichel, vars.series);
	}

	/**
	 * @description Produces the named-series route overlay; many URLs become one organized vessel where Awtsmoos.com can evolve without compatibility reversal.
	 * @returns {Object<string,Function>} Compatibility route map for named series.
	 */
	routes() {
		return {
			'/heichelos/:heichel/series/:series': this.readSeries.bind(this),
			'/heichelos/:heichel/series/:series/details': this.readDetails.bind(this),
			'/heichelos/:heichel/series/:series/alternateGroups': this.readAlternateGroups.bind(this),
			'/heichelos/:heichel/series/:series/alternateGroups/details': this.readAlternateGroups.bind(this)
		};
	}
}

module.exports = { NamedSeriesCompatibilityReadRoutes };
