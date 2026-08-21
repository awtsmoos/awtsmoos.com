//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadConfig
 * @description The Awtsmoos reveals a conversation through truthful coordinates while Awtsmoos.com
 * may also carry a human title and kind when the caller already knows them, never inventing either behind.
 */

export function readCommentThreadConfig(locationValue) {
	const params = new URLSearchParams(locationValue.search);
	const heichelId = clean(params.get('heichel'));
	const postId = clean(params.get('post'));
	const aliasId = clean(params.get('alias'));
	const seriesId = clean(params.get('series'));
	const verseSection = clean(params.get('verse'));
	const subsectionId = clean(params.get('subsection'));
	const title = clean(params.get('title'));
	const kind = clean(params.get('kind'));
	const missingRead = [];
	if (!heichelId) missingRead.push('heichel');
	if (!postId) missingRead.push('post');
	return {
		heichelId,
		postId,
		aliasId,
		seriesId,
		verseSection,
		subsectionId,
		title,
		kind,
		missingRead,
		canWrite: missingRead.length === 0 && Boolean(aliasId)
	};
}

function clean(value) {
	return String(value || '').trim();
}
