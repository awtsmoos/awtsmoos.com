//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Server-first public Torah post renderer.
 * @description The Awtsmoos resolves the teaching once, sends readable Torah immediately,
 * and leaves comments, public translations, and richer interaction outside first-byte work.
 */
const { createReaderData } = require('./readerData.js');
const { buildPostSemantic } = require('./postSemantic.js');
const { postStructuredDataTag } = require('./postStructuredData.js');
const { renderInitialPostPreview } = require('./initialPostPreview.js');
const { traceAsync } = require('./torahRouteTrace.js');
const { makeHtmlResponse } = require('../../../../ayzarim/awtsmoosDynamicServer/response/dynamicResponseShape.js');

/**
 * Friendly "post not found" vessel (S3-MINOR-1).
 * Same copy as the client BootstrapFailurePresenter uses for
 * READER_CLIENT_POST_MISSING_* — the server answers 404 with this instead
 * of a misleading 200 + generic "Torah Teaching" shell.
 */
function renderPostNotFoundHtml(vars) {
	const safe = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	const seriesHref = `/heichelos/${encodeURIComponent(vars.heichel || 'ikar')}/series/${encodeURIComponent(vars.series || 'root')}`;
	return `<!doctype html>
<html lang="en" data-geelooy-route="post-not-found">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Post not found — Awtsmoos</title>
<style>
:root{--bg:#f7f1e3;--panel:#fffdf6;--ink:#2e2417;--muted:#6d5c40;--accent:#8a6d3b;--line:#e3d5b8}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:var(--bg);color:var(--ink);font-family:Georgia,'Times New Roman',serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center}
.card{background:var(--panel);border:1px solid var(--line);border-radius:1rem;padding:2.5rem 2rem;max-width:34rem}
h1{font-size:1.6rem;margin:0 0 .75rem}
.he{font-size:1.25rem;color:var(--muted);margin:0 0 1rem}
p{line-height:1.6;color:var(--muted)}
a{color:var(--accent)}
</style>
</head>
<body>
<main class="card">
<h1>Post not found</h1>
<p class="he" dir="rtl" lang="he">הדף לא נמצא</p>
<p>This post could not be found. It may have been moved or not yet published.</p>
<p><a href="${safe(seriesHref)}">Back to the series</a> · <a href="/heichelos/ikar">Torah Library</a> · <a href="/">Awtsmoos.com home</a></p>
</main>
</body>
</html>`;
}

function renderPostNotFound(vars) {
	return makeHtmlResponse(renderPostNotFoundHtml(vars), 404);
}

function createPostReader($i) {
	const readerData = createReaderData($i);

	function routeContext(data) {
		return {
			heichelId: data.heichel?.id || '',
			seriesId: data.parentSeries || '',
			postId: data.postId || ''
		};
	}

	/**
	 * Renders only document-critical fragments.
	 * Sources/comments/translations must never hold the first visible Torah hostage.
	 */
	async function renderReaderFragments(data, semantic) {
		const context = routeContext(data);
		const [postSemanticHead, readerSettingsHtml] = await Promise.all([
			traceAsync(
				'reader-fragment:semantic-head',
				() => $i.$ga('./post/semantic-head.html', { semantic }),
				context
			),
			traceAsync(
				'reader-fragment:settings',
				() => $i.$ga('./post/reader-settings.html'),
				context
			)
		]);
		return {
			postSemanticHead: postSemanticHead || '',
			readerSettingsHtml: readerSettingsHtml || '',
			initialContentHtml: renderInitialPostPreview(data),
			postAnnotationsHtml: ''
		};
	}

	/** Resolves one teaching into the public reader template. */
	async function renderResolvedReader(data) {
		const context = routeContext(data);
		const semantic = {
			...buildPostSemantic(data),
			structuredDataTag: postStructuredDataTag(data)
		};
		const fragments = await traceAsync(
			'reader:critical-fragments',
			() => renderReaderFragments(data, semantic),
			context
		);
		// B"H — Coby Nov 10: the reader "lands a few versions before" — the
		// post HTML had NO Cache-Control, so browsers heuristically cached
		// it and served old version pins. Wrap in makeHtmlResponse so the
		// HTML carries Cache-Control: no-store like the 404 path already does.
		const html = await traceAsync(
			'reader:final-template',
			() => $i.$ga('./post/_awtsmoos.post.html', { ...data, semantic, ...fragments }),
			context
		);
		return makeHtmlResponse(html);
	}

	function renderPost(vars) {
		return traceAsync(
			'reader-data:direct-total',
			async () => {
				const data = await readerData.loadDirect(vars.heichel, vars.post);
				if (!data.post) return renderPostNotFound(vars);
				return renderResolvedReader(data);
			},
			{ heichelId: vars.heichel, postId: vars.post }
		);
	}

	function renderSeriesPost(vars) {
		return traceAsync(
			'reader-data:series-total',
			async () => {
				const data = await readerData.loadSeriesPost(
					vars.heichel,
					vars.series,
					vars.post,
					{ israel: String(vars.chitasIsrael || vars.query?.chitasIsrael || '') === '1' }
				);
				if (!data.post) return renderPostNotFound(vars);
				return renderResolvedReader(data);
			},
			{ heichelId: vars.heichel, seriesId: vars.series, postId: vars.post }
		);
	}

	function renderSeriesIndexPost(vars) {
		return traceAsync(
			'reader-data:index-total',
			async () => renderResolvedReader(await readerData.loadSeriesIndex(vars.heichel, vars.series, vars.entry)),
			{ heichelId: vars.heichel, seriesId: vars.series, indexInSeries: vars.entry }
		);
	}

	return { renderPost, renderSeriesPost, renderSeriesIndexPost };
}

module.exports = createPostReader;
