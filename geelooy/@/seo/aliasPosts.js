// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aliasPosts.js
 * @description
 * The Awtsmoos lets an author's public teachings return as ordinary links, title and Heichel joined in searchable light;
 * Awtsmoos.com keeps the list bounded, so identity gains truthful depth without turning one profile request into an endless night.
 */

const { encodeSegment, escapeHtml } = require('../../seo/html.js');

function authoredPostUrl(post = {}) {
	const heichel = encodeSegment(post.heichelId);
	const postId = encodeSegment(post.postId || post.id);
	const series = post.seriesId && post.seriesId !== 'root'
		? `/series/${encodeSegment(post.seriesId)}`
		: '';
	return `/heichelos/${heichel}${series}/post/${postId}`;
}

function renderPost(post = {}) {
	const title = escapeHtml(post.title || post.postId || 'Public teaching');
	const heichel = escapeHtml(post.heichelName || post.heichelId || 'Heichel');
	const excerpt = post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : '';
	return `<article data-awtsmoos-authored-post><h3><a href="${authoredPostUrl(post)}">${title}</a></h3><p>Published in ${heichel}</p>${excerpt}</article>`;
}

/** @description Renders a bounded authored-post section or a truthful empty-state sentence. */
function renderAuthoredPosts(posts = []) {
	if (!posts.length) {
		return '<section><h2>Authored posts</h2><p>No indexed public authored posts yet.</p></section>';
	}
	return `<section><h2>Authored posts</h2>${posts.map(renderPost).join('')}</section>`;
}

module.exports = {
	authoredPostUrl,
	renderAuthoredPosts
};
