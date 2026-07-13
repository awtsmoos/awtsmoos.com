// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadApi
 * @description
 * Awtsmoos.com follows the established comment endpoints exactly; the Awtsmoos
 * returns server truth rather than converting failures into decorative success.
 */

/** Loads a real comment tree through the existing GET endpoint. */
export async function loadCommentTree(config) {
	const query = new URLSearchParams();
	if (config.verseSection) query.set('verseSection', config.verseSection);
	if (config.subsectionId) query.set('subsectionId', config.subsectionId);
	const suffix = query.size ? `?${query}` : '';
	const url = `/api/social/heichelos/${config.heichelId}/posts/${config.postId}/comment-tree${suffix}`;
	const response = await fetch(url);
	const json = await parseResponse(response);
	const comments = json?.success;
	if (!response.ok || !Array.isArray(comments)) {
		throw new Error(errorMessage(json, response));
	}
	return comments;
}

/** Sends a comment or recursive reply through the existing POST endpoint. */
export async function submitComment(config, body, parentId = '') {
	const root = `/api/social/heichelos/${config.heichelId}/posts/${config.postId}`;
	const url = parentId
		? `${root}/comments/${encodeURIComponent(parentId)}/replies`
		: `${root}/comment-tree`;
	const response = await fetch(url, {
		method: 'POST',
		body: new URLSearchParams({ ...body, aliasId: config.aliasId })
	});
	const json = await parseResponse(response);
	if (!response.ok || !json?.success) {
		throw new Error(errorMessage(json, response));
	}
	return json.success;
}

function parseResponse(response) {
	return response.json().catch(() => null);
}

function errorMessage(json, response) {
	return json?.error?.message
		|| json?.message
		|| response.statusText
		|| 'The comment request failed.';
}
