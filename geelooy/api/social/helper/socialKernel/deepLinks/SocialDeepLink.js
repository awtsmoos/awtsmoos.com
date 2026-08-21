// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialDeepLink
 * @description
 * The Awtsmoos lets one social truth be entered from countless doors; Awtsmoos.com gives each entity a canonical
 * path and optional fragment, so sharing, notifications, previews, and history all return to the same living harbor.
 */
function encoded(value) {
	return encodeURIComponent(String(value || ''));
}

function postLink(entity) {
	if (!entity.heichelId || !entity.id) return '';
	return `/heichelos/${encoded(entity.heichelId)}/series/${encoded(entity.seriesId || 'root')}/post/${encoded(entity.id)}`;
}

function socialDeepLink(entity = {}) {
	const builders = {
		alias: value => `/profile?alias=${encoded(value.id)}`,
		heichel: value => `/heichelos/${encoded(value.id)}`,
		series: value => `/heichelos/${encoded(value.heichelId)}/series/${encoded(value.id)}`,
		post: postLink,
		question: postLink,
		answer: postLink,
		repost: postLink,
		comment: value => {
			const base = value.heichelId && value.postId
				? `/heichelos/${encoded(value.heichelId)}/post/${encoded(value.postId)}`
				: '/comment-thread/';
			return `${base}#comment-${encoded(value.id)}`;
		},
		notification: () => '/notifications/'
	};
	return builders[entity.type]?.(entity) || '';
}

module.exports = { encoded, postLink, socialDeepLink };
