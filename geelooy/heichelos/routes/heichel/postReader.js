// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postReader.js
 * @description
 * The Awtsmoos gathers each public teaching into completed server fragments before the shell is born;
 * Awtsmoos.com therefore reveals title, Torah, and reader vessels in one truthful first response,
 * while JavaScript may later deepen the same revelation without becoming its only source.
 */

const { createReaderData } = require('./readerData.js');
const { buildPostSemantic } = require('./postSemantic.js');

/**
 * @description Creates public post renderers bound to one dynamic request vessel.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {object} Direct, named-series, and numeric-Road renderers.
 */
function createPostReader($i) {
	const readerData = createReaderData($i);

	/**
	 * @description Renders search and reading fragments from the proven route-relative template context.
	 * @param {object} data Fully resolved reader data.
	 * @param {object} semantic Search-facing semantic model.
	 * @returns {Promise<object>} Finished HTML fragments for the shell.
	 */
	async function renderReaderFragments(data, semantic) {
		const initialContentData = {
			post: data.post || null,
			heichel: data.heichel || null,
			alias: data.alias || null,
			parentSeries: data.parentSeries || '',
			postId: data.postId || '',
			indexInSeries: data.indexInSeries || ''
		};
		const [postSemanticHead, readerSettingsHtml, initialContentHtml] = await Promise.all([
			$i.$ga('./post/semantic-head.html', { semantic }),
			$i.$ga('./post/reader-settings.html'),
			$i.$ga('./post/initial-content.html', initialContentData)
		]);
		return {
			postSemanticHead: postSemanticHead || '',
			readerSettingsHtml: readerSettingsHtml || '',
			initialContentHtml: initialContentHtml || ''
		};
	}

	/**
	 * @description Renders one fully resolved reader after all SEO-critical fragments are complete.
	 * @param {object} data Fully resolved reader data.
	 * @returns {Promise<string>} Finished reader document.
	 */
	async function renderResolvedReader(data) {
		const semantic = buildPostSemantic(data);
		const fragments = await renderReaderFragments(data, semantic);
		return $i.$ga('./post/_awtsmoos.post.html', {
			...data,
			semantic,
			...fragments
		});
	}

	/** @description Renders a direct root-series post doorway. */
	async function renderPost(vars) {
		const data = await readerData.loadDirect(vars.heichel, vars.post);
		return renderResolvedReader(data);
	}

	/** @description Renders a stable named post inside its public series. */
	async function renderSeriesPost(vars) {
		const data = await readerData.loadSeriesPost(vars.heichel, vars.series, vars.post);
		return renderResolvedReader(data);
	}

	/** @description Resolves a historic numeric Road position before rendering the stable teaching. */
	async function renderSeriesIndexPost(vars) {
		const data = await readerData.loadSeriesIndex(vars.heichel, vars.series, vars.entry);
		return renderResolvedReader(data);
	}

	return { renderPost, renderSeriesPost, renderSeriesIndexPost };
}

module.exports = createPostReader;
