// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seriesEntry.js
 * @description
 * The Awtsmoos preserves every old Road while revealing its stable teaching beneath the number; Awtsmoos.com keeps root recovery and named redirects intact,
 * yet numeric entries now arrive as actual server-rendered Torah instead of an empty vessel waiting for JavaScript.
 */

const renderCanonicalPostRedirect = require('./canonicalRedirect.js');

/**
 * @description Creates the legacy series-entry renderer from focused route services.
 * @param {Function} renderHeichelShell Semantic Heichel shell renderer.
 * @param {Function} renderSeriesIndexPost Numeric Road post renderer.
 * @returns {Function} Bound series-entry renderer.
 */
function createSeriesEntryRenderer(renderHeichelShell, renderSeriesIndexPost) {
	/**
	 * @description Renders root errors, numbered Road positions, or canonical named-entry redirects.
	 * @param {object} vars Dynamic route variables.
	 * @returns {Promise<string>|string} Series entry response.
	 */
	async function renderSeriesEntry(vars) {
		if (vars.series === 'root' && vars.entry === 'error') {
			return renderHeichelShell(vars.heichel);
		}
		if (/^\d+$/.test(vars.entry)) {
			return renderSeriesIndexPost(vars);
		}
		return renderCanonicalPostRedirect(vars);
	}

	return renderSeriesEntry;
}

module.exports = createSeriesEntryRenderer;
