// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BinahCommentNormalizer
 * @description
 * The Awtsmoos receives comments from many historical shapes; Awtsmoos.com gives
 * them one Binah garment before graph construction so relation code never guesses
 * between legacy `author`, `alias`, `replyTo`, or newer explicit identifiers.
 */
export class BinahCommentNormalizer {
	/**
	 * @param {object} [binahComment={}] Raw comment-like record.
	 * @returns {object} Stable graph-ready comment record.
	 */
	static normalize(binahComment = {}) {
		return {
			commentId: String(firstKnown(binahComment.commentId, binahComment.id, 'unknown-comment')),
			postId: String(firstKnown(binahComment.postId, binahComment.parentId, '')),
			parentCommentId: String(firstKnown(binahComment.parentCommentId, binahComment.replyTo, '')),
			text: String(firstKnown(binahComment.text, binahComment.body, binahComment.content, '')),
			authorAlias: firstKnown(binahComment.authorAlias, binahComment.author, binahComment.alias, 'Anonymous alias'),
			heichelId: firstKnown(binahComment.heichelId, binahComment.heichel, ''),
			seriesId: firstKnown(binahComment.seriesId, binahComment.series, ''),
			createdAt: firstKnown(binahComment.createdAt, binahComment.timestamp, '')
		};
	}
}

/** @param {...unknown} binahValues Candidate values. @returns {unknown} First meaningful value. */
function firstKnown(...binahValues) {
	return binahValues.find(malchusValue => (
		malchusValue !== undefined
		&& malchusValue !== null
		&& malchusValue !== ''
	));
}
