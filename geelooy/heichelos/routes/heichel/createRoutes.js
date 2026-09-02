// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRoutes.js
 * @description
 * The Awtsmoos orders every Heichel doorway from sitemap to comment to translation to teaching, specific before general in rhyme;
 * Awtsmoos.com preserves editor and reader contracts while public discussion receives its own canonical time.
 */

const createCommentPage = require('./comments/commentPage.js');
const createEditorRoutes = require('./editorRoutes.js');
const createPostReader = require('./postReader.js');
const createSeriesEntryRenderer = require('./seriesEntry.js');
const createShellRenderer = require('./shell.js');
const createSitemapRoutes = require('./sitemap/routes.js');
const createTranslationPage = require('./translations/page.js');

function createRoutes($i) {
	const { renderCommentPage } = createCommentPage($i);
	const { renderHeichelShell } = createShellRenderer($i);
	const { renderDelete, renderGlobalSubmit, renderSubmit } = createEditorRoutes($i);
	const { renderPost, renderSeriesPost, renderSeriesIndexPost } = createPostReader($i);
	const { renderHeichelSeedSitemap } = createSitemapRoutes($i);
	const { renderTranslationPage } = createTranslationPage($i);
	const renderSeriesEntry = createSeriesEntryRenderer(renderHeichelShell, renderSeriesIndexPost);
	return {
		'/': async function renderHeichelIndex() { return $i.$ga('_awtsmoos.index.html'); },
		'/sitemap.xml': async function renderPublicHeichelSeedSitemap() { return renderHeichelSeedSitemap(); },
		'/:heichel/posts/:post/comments/:comment': async function renderPublicComment(vars) { return renderCommentPage(vars); },
		'/:heichel/series/:series/post/:post/translations': async function renderPublicTranslations(vars) { return renderTranslationPage(vars); },
		'/submit': async function renderGlobalSubmission() { return renderGlobalSubmit(); },
		'/:heichel/series/root/error': async function renderRootError(vars) { return renderHeichelShell(vars.heichel); },
		'/:heichel/series/:series/index': async function renderSeriesIndex(vars) { return renderHeichelShell(vars.heichel, vars.series); },
		'/:heichel/series/:series': async function renderSeries(vars) { return renderHeichelShell(vars.heichel, vars.series); },
		'/:heichel/delete': async function renderDeletion(vars) { return renderDelete(vars); },
		'/:heichel/edit': async function renderEdit() { return $i.$ga('_awtsmoos.submitToHeichel.html'); },
		'/:heichel/submit': async function renderSubmission(vars) { return renderSubmit(vars.heichel); },
		'/:heichel/submitPost': async function renderPostSubmission(vars) { return $i.$ga('./heichel/submit/_awtsmoos.post.html', { heichel: vars.heichel }); },
		'/:heichel/post/:post': async function renderDirectPost(vars) { return renderPost(vars); },
		'/:heichel/series/:series/post/:post': async function renderNamedSeriesPost(vars) { return renderSeriesPost(vars); },
		'/:heichel/series/:series/:entry': async function renderSeriesEntryRoute(vars) { return renderSeriesEntry(vars); },
		'/:heichel': async function renderHeichel(vars) { return renderHeichelShell(vars.heichel); }
	};
}

module.exports = createRoutes;
