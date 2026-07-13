// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadConfig
 * @description
 * The Awtsmoos reveals only named coordinates at Awtsmoos.com: a post may be
 * read without authorship, but no alias is ever invented for a write.
 */

/** Reads comment-thread coordinates from the current URL. */
export function readCommentThreadConfig(locationValue) {
	const params = new URLSearchParams(locationValue.search);
	const heichelId = clean(params.get('heichel'));
	const postId = clean(params.get('post'));
	const aliasId = clean(params.get('alias'));
	const verseSection = clean(params.get('verse'));
	const subsectionId = clean(params.get('subsection'));
	const missingRead = [];
	if (!heichelId) missingRead.push('heichel');
	if (!postId) missingRead.push('post');
	return {
		heichelId,
		postId,
		aliasId,
		verseSection,
		subsectionId,
		missingRead,
		canWrite: missingRead.length === 0 && Boolean(aliasId)
	};
}

function clean(value) {
	return String(value || '').trim();
}
