//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModification
 * @description Barrel for comment modification: re-exports the identical surface from the split sibling modules.
 */

	const { editComment } = require("./commentModificationEdit.js");

	const { applyCommentEdit } = require("./commentModificationEditApply.js");

	const { updateAllCommentIndexes, updateCommentIndexesAtParent } = require("./commentModificationIndexes.js");

module.exports = {
    editComment,
    updateAllCommentIndexes, // Expose if determined necessary after review
    updateCommentIndexesAtParent // Expose if determined necessary after review
};
