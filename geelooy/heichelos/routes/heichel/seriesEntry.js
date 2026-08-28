// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seriesEntry.js
 * @description
 * The Awtsmoos distinguishes ancient numeric positions from named post identities without losing either road; Awtsmoos.com keeps root-error links alive,
 * opens numeric legacy readers directly, and turns named entries toward one canonical post path where future navigation may thrive.
 */

const renderCanonicalPostRedirect = require('./canonicalRedirect.js');

/**
 * @description Creates the legacy series-entry renderer with access to the current shell renderer.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @param {Function} renderHeichelShell Semantic shell renderer.
 * @returns {Function} Bound series-entry renderer.
 */
function createSeriesEntryRenderer($i, renderHeichelShell) {
	/**
	 * @description Renders root errors, numeric legacy positions, or canonical named-entry redirects.
	 * @param {object} vars Dynamic route variables.
	 * @returns {Promise<string>|string} Series entry response.
	 */
	async function renderSeriesEntry(vars) {
		if (vars.series === 'root' && vars.entry === 'error') {
			return renderHeichelShell(vars.heichel);
		}
		if (/^\d+$/.test(vars.entry)) {
			return $i.$ga('./post/_awtsmoos.post.html', {
				heichel: vars.heichel,
				parentSeries: vars.series,
				indexInSeries: vars.entry
			});
		}
		return renderCanonicalPostRedirect(vars);
	}

	return renderSeriesEntry;
}

module.exports = createSeriesEntryRenderer;
