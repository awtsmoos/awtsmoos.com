//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Server-first public Torah post renderer.
 * @description The Awtsmoos gathers teaching, metadata, identity, settings, sources, discussion, and translations before the shell is born; optional timing reveals cold vessels without changing ordinary output.
 */
const { createReaderData } = require('./readerData.js');
const { buildPostSemantic } = require('./postSemantic.js');
const { postStructuredDataTag } = require('./postStructuredData.js');
const { renderPostAnnotations } = require('./comments/postAnnotations.js');
const { traceAsync } = require('./torahRouteTrace.js');

function createPostReader($i) {
	const readerData = createReaderData($i);

	/** Renders all server-critical fragments in parallel and names each cold stage only when tracing is enabled. */
	async function renderReaderFragments(data, semantic) {
		const context = {
			heichelId: data.heichel?.id || '',
			seriesId: data.parentSeries || '',
			postId: data.postId || ''
		};
		const initialContentData = {
			post: data.post || null,
			heichel: data.heichel || null,
			alias: data.alias || null,
			parentSeries: data.parentSeries || '',
			postId: data.postId || '',
			indexInSeries: data.indexInSeries || ''
		};
		const parts = await Promise.all([
			traceAsync('reader-fragment:semantic-head', () => $i.$ga('./post/semantic-head.html', { semantic }), context),
			traceAsync('reader-fragment:settings', () => $i.$ga('./post/reader-settings.html'), context),
			traceAsync('reader-fragment:initial-content', () => $i.$ga('./post/initial-content.html', initialContentData), context),
			traceAsync('reader-fragment:annotations', () => renderPostAnnotations($i, data), context)
		]);
		return {
			postSemanticHead: parts[0] || '',
			readerSettingsHtml: parts[1] || '',
			initialContentHtml: parts[2] || '',
			postAnnotationsHtml: parts[3] || ''
		};
	}

	/** Resolves one teaching into the complete public reader template. */
	async function renderResolvedReader(data) {
		const context = {
			heichelId: data.heichel?.id || '',
			seriesId: data.parentSeries || '',
			postId: data.postId || ''
		};
		const semantic = {
			...buildPostSemantic(data),
			structuredDataTag: postStructuredDataTag(data)
		};
		const fragments = await traceAsync(
			'reader:fragments',
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
			async () => renderResolvedReader(await readerData.loadSeriesPost(vars.heichel, vars.series, vars.post)),
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
