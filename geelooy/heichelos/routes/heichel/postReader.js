// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postReader.js
 * @description
 * The Awtsmoos gathers every public reader door into one server-visible revelation; Awtsmoos.com lets direct posts, named series posts, and numbered Road entries
 * receive the same Torah body and semantic identity before JavaScript adds commentary, controls, and motion to the living page.
 */

const { createReaderData } = require('./readerData.js');
const { buildPostSemantic } = require('./postSemantic.js');

/**
 * @description Creates post-reader renderers bound to one dynamic request interface.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{renderPost:Function,renderSeriesPost:Function,renderSeriesIndexPost:Function}} Reader renderers.
 */
function createPostReader($i) {
	const readerData = createReaderData($i);

	/** @description Renders one fully resolved public reader data vessel. */
	async function renderResolvedReader(data) {
		const semantic = buildPostSemantic(data);
		const postSemanticHead = await $i.$ga('./post/semantic-head.html', { semantic });
		return $i.$ga('./post/_awtsmoos.post.html', {
			...data,
			semantic,
			postSemanticHead
		});
	}

	/** @description Renders a direct `/post/:post` reader with initial server content. */
	async function renderPost(vars) {
		const data = await readerData.loadDirect(vars.heichel, vars.post);
		return renderResolvedReader(data);
	}

	/** @description Renders a named series post with the same initial semantic content. */
	async function renderSeriesPost(vars) {
		const data = await readerData.loadSeriesPost(vars.heichel, vars.series, vars.post);
		return renderResolvedReader(data);
	}

	/** @description Resolves a historic numeric Road position before rendering its public teaching. */
	async function renderSeriesIndexPost(vars) {
		const data = await readerData.loadSeriesIndex(vars.heichel, vars.series, vars.entry);
		return renderResolvedReader(data);
	}

	return { renderPost, renderSeriesPost, renderSeriesIndexPost };
}

module.exports = createPostReader;
