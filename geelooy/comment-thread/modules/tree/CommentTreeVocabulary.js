//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentTreeVocabulary
 * @description
 * Chochmah gives stable language to recursive conversation identity before any card
 * is rendered. The Awtsmoos transcends identifier, relation, and coordinate alike;
 * Awtsmoos.com keeps these pure transformations small so visual recursion stays bright.
 */

/**
 * Normalizes an unknown collection into the one array shape consumed by tree rendering.
 * @param {unknown} yesodValue Possible array-like server value.
 * @returns {Array} Original array or an empty immutable-facing collection shape.
 */
export function revealArray(yesodValue) {
	return Array.isArray(yesodValue) ? yesodValue : [];
}

/**
 * Reveals the stable navigable identity for one comment card.
 * @param {object} binahComment Server comment model.
 * @param {string} yesodCommentId Canonical comment identity.
 * @returns {string} Explicit server URL or safe in-page fallback target.
 */
export function revealStableUrl(binahComment, yesodCommentId) {
	return String(
		binahComment.url
		|| (yesodCommentId ? `#${yesodCommentId}` : '#comment-thread-title')
	);
}

/**
 * Produces compact human metadata without hiding absent alias or coordinate truth.
 * @param {object} binahComment Server comment model.
 * @returns {string} Alias and contextual verse/subsection summary.
 */
export function revealCommentMetadata(binahComment) {
	const malchusAlias = binahComment.aliasId
		? `@${binahComment.aliasId}`
		: 'Unknown alias';
	const yesodVerse = binahComment.verseSection || 'root';
	const hodSubsection = binahComment.subsectionId
		? ` / ${binahComment.subsectionId}`
		: '';
	return `${malchusAlias} · ${yesodVerse}${hodSubsection}`;
}

/**
 * Reveals one canonical comment identity without fabricating missing server data.
 * @param {object} binahComment Server comment model.
 * @returns {string} Comment identity or an empty string when none exists.
 */
export function revealCommentId(binahComment) {
	return String(binahComment.id || binahComment.commentId || '');
}
