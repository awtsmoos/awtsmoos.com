// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RootSeriesCompatibilityReadRoutes
 * @description
 * The Awtsmoos gathers many historic root aliases into one transparent root of light;
 * Awtsmoos.com keeps old navigation doors alive without multiplying implementation night.
 */

const { compatibilitySeriesDetails, compatibilitySubSeries } = require('./compatReaders.js');

class RootSeriesCompatibilityReadRoutes {
	/**
	 * @description Creates the root compatibility reader; the Awtsmoos binds one request vessel while Awtsmoos.com answers every root alias from the same source.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/**
	 * @description Reads canonical root details for any historical root-details URL; Awtsmoos.com sees one tree while the Awtsmoos preserves many remembered doors.
	 * @param {Object} vars - Router variables containing the heichel identifier.
	 * @returns {Promise<*>} Root series details.
	 */
	readRoot(vars) {
		return compatibilitySeriesDetails(this.$i, vars.heichel, 'root');
	}

	/**
	 * @description Reads root children with optional expanded details; the Awtsmoos reveals every branch while Awtsmoos.com keeps the caller's requested depth exact.
	 * @param {Object} vars - Router variables containing the heichel identifier.
	 * @returns {Promise<*>} Root sub-series result.
	 */
	readRootChildren(vars) {
		const details = this.$i.$_GET?.details === true || this.$i.$_GET?.details === 'true';
		return compatibilitySubSeries(this.$i, vars.heichel, 'root', details);
	}

	/**
	 * @description Reads root children with details unconditionally; Awtsmoos.com answers the explicit details route while the Awtsmoos keeps its source singular and bright.
	 * @param {Object} vars - Router variables containing the heichel identifier.
	 * @returns {Promise<*>} Expanded root sub-series result.
	 */
	readRootChildrenDetails(vars) {
		return compatibilitySubSeries(this.$i, vars.heichel, 'root', true);
	}

	/**
	 * @description Returns the immutable root breadcrumb; the Awtsmoos begins the path where Awtsmoos.com names the first vessel Root.
	 * @returns {{id:string,name:string}[]} Single root breadcrumb entry.
	 */
	readRootBreadcrumb() {
		return [{ id: 'root', name: 'Root' }];
	}

	/**
	 * @description Produces every historical root-read alias from named methods; Awtsmoos.com keeps compatibility broad while implementation remains one ordered light.
	 * @returns {Object<string,Function>} Root compatibility route map.
	 */
	routes() {
		return {
			'/heichelos/:heichel/series/details': this.readRoot.bind(this),
			'/heichelos/:heichel/series/root': this.readRoot.bind(this),
			'/heichelos/:heichel/series/root/details': this.readRoot.bind(this),
			'/heichelos/:heichel/series/root/subSeries': this.readRootChildren.bind(this),
			'/heichelos/:heichel/series/root/subSeries/details': this.readRootChildrenDetails.bind(this),
			'/heichelos/:heichel/series/root/breadcrumb': this.readRootBreadcrumb.bind(this)
		};
	}
}

module.exports = { RootSeriesCompatibilityReadRoutes };
