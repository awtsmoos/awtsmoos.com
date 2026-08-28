// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postReader.js
 * @description
 * The Awtsmoos gathers post, Heichel, and author into the first readable Torah vessel; Awtsmoos.com preserves both direct and series-scoped reader doors,
 * letting server truth appear before commentary and interactive controls arrive from their later shores.
 */

const { aliasFields, heichelFields, postFields } = require('./fieldMaps.js');

/**
 * @description Creates post-reader renderers bound to one dynamic request interface.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{renderPost:Function,renderSeriesPost:Function}} Post route renderers.
 */
function createPostReader($i) {
	/**
	 * @description Fetches complete initial reader metadata for a direct post route.
	 * @param {object} vars Dynamic route variables.
	 * @returns {Promise<string>} Server-rendered post reader HTML.
	 */
	async function renderPost(vars) {
		const post = await $i.fetchAwtsmoos(
			`/api/social/heichelos/${vars.heichel}/post/${encodeURIComponent(vars.post)}?${postFields()}`
		);
		const heichel = await $i.fetchAwtsmoos(
			`/api/social/heichelos/${encodeURIComponent(vars.heichel)}?${heichelFields()}`
		);
		const alias = post?.author
			? await $i.fetchAwtsmoos(`/api/social/aliases/${encodeURIComponent(post.author)}?${aliasFields()}`)
			: null;
		if (alias && post?.author) {
			alias.id = post.author;
		}
		if (heichel) {
			heichel.id = vars.heichel;
		}
		if (post) {
			post.id = vars.post;
			post.heichel = heichel;
		}
		return $i.$ga('./post/_awtsmoos.post.html', { heichel, post, alias });
	}

	/**
	 * @description Preserves the historical series-scoped post reader contract.
	 * @param {object} vars Dynamic route variables.
	 * @returns {Promise<string>} Post reader HTML.
	 */
	async function renderSeriesPost(vars) {
		return $i.$ga('./post/_awtsmoos.post.html', {
			heichel: vars.heichel,
			parentSeries: vars.series,
			postId: vars.post
		});
	}

	return { renderPost, renderSeriesPost };
}

module.exports = createPostReader;
