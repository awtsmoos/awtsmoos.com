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
		return traceAsync(
			'reader:final-template',
			() => $i.$ga('./post/_awtsmoos.post.html', { ...data, semantic, ...fragments }),
			context
		);
	}

	function renderPost(vars) {
		return traceAsync(
			'reader-data:direct-total',
			async () => renderResolvedReader(await readerData.loadDirect(vars.heichel, vars.post)),
			{ heichelId: vars.heichel, postId: vars.post }
		);
	}

	function renderSeriesPost(vars) {
		return traceAsync(
			'reader-data:series-total',
			async () => renderResolvedReader(await readerData.loadSeriesPost(
				vars.heichel,
				vars.series,
				vars.post,
				{ israel: String(vars.chitasIsrael || vars.query?.chitasIsrael || '') === '1' }
			)),
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
