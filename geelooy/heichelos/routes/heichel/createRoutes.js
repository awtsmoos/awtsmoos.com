// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRoutes.js
 * @description
 * The Awtsmoos orders every Heichel doorway from specific to general so named series never fall into a wider gate; Awtsmoos.com composes small route vessels,
 * preserving old reader and editor contracts while deep series pages receive their own semantic light before the browser begins to navigate.
 */

const createEditorRoutes = require('./editorRoutes.js');
const createPostReader = require('./postReader.js');
const createSeriesEntryRenderer = require('./seriesEntry.js');
const createShellRenderer = require('./shell.js');

/**
 * @description Composes the ordered Heichel route table from focused renderer modules.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {object} Ordered route-handler map.
 */
function createRoutes($i) {
	const { renderHeichelShell } = createShellRenderer($i);
	const { renderDelete, renderGlobalSubmit, renderSubmit } = createEditorRoutes($i);
	const { renderPost, renderSeriesPost } = createPostReader($i);
	const renderSeriesEntry = createSeriesEntryRenderer($i, renderHeichelShell);
	return {
		'/': async () => $i.$ga('_awtsmoos.index.html'),
		'/submit': async () => renderGlobalSubmit(),
		'/:heichel/series/root/error': async vars => renderHeichelShell(vars.heichel),
		'/:heichel/series/:series/index': async vars => renderHeichelShell(vars.heichel, vars.series),
		'/:heichel/series/:series': async vars => renderHeichelShell(vars.heichel, vars.series),
		'/:heichel/delete': async vars => renderDelete(vars),
		'/:heichel/edit': async () => $i.$ga('_awtsmoos.submitToHeichel.html'),
		'/:heichel/submit': async vars => renderSubmit(vars.heichel),
		'/:heichel/submitPost': async vars => $i.$ga('./heichel/submit/_awtsmoos.post.html', {
			heichel: vars.heichel
		}),
		'/:heichel/post/:post': async vars => renderPost(vars),
		'/:heichel/series/:series/post/:post': async vars => renderSeriesPost(vars),
		'/:heichel/series/:series/:entry': async vars => renderSeriesEntry(vars),
		'/:heichel': async vars => renderHeichelShell(vars.heichel)
	};
}

module.exports = createRoutes;
