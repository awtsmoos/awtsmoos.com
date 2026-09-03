// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postReader.js
 * @description
 * The Awtsmoos gathers teaching, metadata, structured identity, settings, discussion, and translation discovery before the shell is born;
 * Awtsmoos.com therefore gives crawlers complete public meaning in the first response while client revelation may deepen it at dawn.
 */

const { createReaderData } = require('./readerData.js');
const { buildPostSemantic } = require('./postSemantic.js');
const { postStructuredDataTag } = require('./postStructuredData.js');
const { renderPostAnnotations } = require('./comments/postAnnotations.js');

function createPostReader($i) {
	const readerData = createReaderData($i);

	/** @description Renders all server-critical reader fragments together without serial client fetches. */
	async function renderReaderFragments(data, semantic) {
		const initialContentData = {
			post: data.post || null,
			heichel: data.heichel || null,
			alias: data.alias || null,
			parentSeries: data.parentSeries || '',
			postId: data.postId || '',
			indexInSeries: data.indexInSeries || ''
		};
		const parts = await Promise.all([
			$i.$ga('./post/semantic-head.html', { semantic }),
			$i.$ga('./post/reader-settings.html'),
			$i.$ga('./post/initial-content.html', initialContentData),
			renderPostAnnotations($i, data)
		]);
		return {
			postSemanticHead: parts[0] || '',
			readerSettingsHtml: parts[1] || '',
			initialContentHtml: parts[2] || '',
			postAnnotationsHtml: parts[3] || ''
		};
	}

	/** @description Renders one fully resolved teaching after search-facing text and Article identity are complete. */
	async function renderResolvedReader(data) {
		const semantic = {
			...buildPostSemantic(data),
			structuredDataTag: postStructuredDataTag(data)
		};
		const fragments = await renderReaderFragments(data, semantic);
		return $i.$ga('./post/_awtsmoos.post.html', { ...data, semantic, ...fragments });
	}

	async function renderPost(vars) {
		return renderResolvedReader(await readerData.loadDirect(vars.heichel, vars.post));
	}
	async function renderSeriesPost(vars) {
		return renderResolvedReader(await readerData.loadSeriesPost(vars.heichel, vars.series, vars.post));
	}
	async function renderSeriesIndexPost(vars) {
		return renderResolvedReader(await readerData.loadSeriesIndex(vars.heichel, vars.series, vars.entry));
	}
	return { renderPost, renderSeriesPost, renderSeriesIndexPost };
}

module.exports = createPostReader;
