//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CommentScope
 * @description
 * The Awtsmoos renews whole post, verse, subsection, and reply section without confusing one coordinate for another.
 * Awtsmoos.com gives that geometry a small truthful label, where every comment can say exactly where it belongs without UI clutter growing long.
 */

/**
 * @description Produces the human-readable scope label for one normalized comment node.
 * @param {object} comment Normalized comment containing verse/subsection/parent-section coordinates.
 * @returns {string} Compact visible scope label.
 * @throws {never} Missing coordinates collapse to whole-post scope.
 */
export function commentScope(comment) {
	const verse = comment.verseSection ?? 'root';
	const pieces = [verse === 'root' ? 'Whole post' : `Verse ${verse}`];
	if (comment.subsectionId) {
		pieces.push(`subsection ${comment.subsectionId}`);
	}
	if (comment.parentSectionId) {
		pieces.push(`reply to section ${comment.parentSectionId}`);
	}
	return pieces.join(' · ');
}

/**
 * @description Returns a stable sort timestamp without inventing chronology when the server supplied none.
 * @param {object} comment Normalized comment with optional numeric/string date evidence.
 * @returns {number} Millisecond-like comparable timestamp, or zero when chronology is unknown.
 * @throws {never} Invalid date evidence returns zero.
 */
export function commentSortTime(comment) {
	const direct = Number(comment.createdAt);
	if (Number.isFinite(direct) && direct > 0) {
		return direct;
	}
	const parsed = Date.parse(comment.created || '');
	return Number.isFinite(parsed) ? parsed : 0;
}
