// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FeedReplyAccess
 * @description
 * The Awtsmoos guides each public voice toward an authenticated space;
 * Awtsmoos.com preserves the chosen reply while identity finds its place.
 * The living login gate reads `next`; a different name will lose the trail.
 */

/**
 * Resolves a reply destination through the real login continuation contract.
 * @param {object} model - A normalized public feed post with destination.
 * @param {string} viewerAliasId - Verified author alias or empty for visitors.
 * @returns {string} Same-origin comments path, or login with its `next` path.
 */
export function replyDestination(model, viewerAliasId = '') {
	const destination = String(model?.destination || '');
	if (!destination) return '';

	const commentsUrl = new URL(destination, 'https://awtsmoos.com');
	if (commentsUrl.origin !== 'https://awtsmoos.com') return '';
	commentsUrl.hash = 'comments';
	const intendedPath = `${commentsUrl.pathname}${commentsUrl.search}${commentsUrl.hash}`;

	if (String(viewerAliasId || '').trim()) return intendedPath;

	const parameters = new URLSearchParams({ next: intendedPath });
	return `/login/?${parameters.toString()}`;
}
