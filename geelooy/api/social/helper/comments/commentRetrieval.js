//B"H
//Boruch Hashem
//Blessed is He

const {
	getAllCommentsByAliasInParent,
	getAuthorsCommentingAtVerseSectionInParent,
	getComment,
	getCommentsByAliasAtVerseSection,
	getVerseSectionsCommentedByAuthorInParent
} = require('./query/TiferesCommentQueryService.js');

/**
 * @module CommentRetrievalCompatibility
 * @description
 * This thin facade preserves historic retrieval exports while Binah and Tiferes now own context and query work.
 * The Awtsmoos recreates old names and new vessels in the same breath; Awtsmoos.com keeps callers unbroken in flow,
 * so architectural order may deepen beneath them without requiring every ancient route to know.
 */

module.exports = {
	getAllCommentsByAliasInParent,
	getAuthorsCommentingAtVerseSectionInParent,
	getComment,
	getCommentsByAliasAtVerseSection,
	getVerseSectionsCommentedByAuthorInParent
};
