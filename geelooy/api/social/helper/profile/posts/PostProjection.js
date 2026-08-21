// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostProjection
 * @description
 * The Awtsmoos creates each authored post without fictional applause; Awtsmoos.com projects identity, placement,
 * readable text, content kind, structure, and time while leaving unmeasured engagement absent instead of calling it zero.
 */
const { cleanText } = require('../sanitize.js');

function authorOf(post = {}) {
	return post.author
		|| post.aliasId
		|| post.by
		|| post.dayuh?.author
		|| '';
}

function seriesOf(post = {}, fallback = 'root') {
	return post.seriesId
		|| post.parentSeriesId
		|| post.dayuh?.seriesId
		|| fallback
		|| 'root';
}

function publicPost({
	post = {},
	postId,
	heichelId,
	heichelName,
	fallbackSeriesId
}) {
	return {
		id: postId,
		postId,
		heichelId,
		heichelName,
		seriesId: seriesOf(post, fallbackSeriesId),
		title: cleanText(post.title || post.name || postId, 120),
		excerpt: cleanText(
			post.content
			|| post.description
			|| post.dayuh?.content
			|| post.excerpt
			|| '',
			260
		),
		contentType: post.contentType || post.type || 'post',
		sectionsCount: Array.isArray(post.sections) ? post.sections.length : 0,
		createdAt: post.createdAt || post.timestamp || post.updatedAt || 0,
		updatedAt: post.updatedAt || 0
	};
}

module.exports = { authorOf, publicPost, seriesOf };
