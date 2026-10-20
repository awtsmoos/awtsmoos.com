//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModificationEdit
 * @description RESIDUE: editComment is one indivisible verbatim function (split from commentModification.js).
 */

const {
    NO_LOGIN,
    sp
} = require("../_awtsmoos.constants.js");

const {
    er,
    myOpts
} = require("../general.js");

const {
    verifyHeichelAuthority
} = require("../heichel.js");

const {
    verifyAliasOwnership // Still needed to ensure editor owns the alias
} = require("../alias.js");

const {
    getAliasCommentFilePath // New path function
} = require("./commentPaths.js");

	const { parseDayuhVessel } = require("./commentModificationParse.js");
	const { applyCommentEdit } = require("./commentModificationEditApply.js");


// Note: addCommentIndexToAlias might not be needed here anymore,
// unless editing could change the series association (unlikely).

/**
 * @method editComment
 * @description Edits an existing comment's content or dayuh.
 * Requires precise identification of the comment via context.
 * @returns {Object} Edit result.
 */
async function editComment(
    {
        $i,
        commentId, // ID of the comment to edit
        // Context to find the comment:
        aliasId,   // Author of the comment
        parentType,
        parentId,
        heichelId,
        postId,    // Required if parentType is "comment"
        seriesId,
        verseSection, // The verse section the comment belongs to
        // New data:
        newContent,
        newDayuh,
        // Verification:
        userid // ID of the user attempting the edit
    }
) {
    // Input Validation & Data Extraction from request ($i.$_PUT assumed)
    if (!commentId) commentId = $i.$_PUT?.commentId;
    if (!aliasId) aliasId = $i.$_PUT?.aliasId;
    if (!parentType) parentType = $i.$_PUT?.parentType || "post";
    if (!parentId) parentId = $i.$_PUT?.parentId;
    if (!heichelId) heichelId = $i.$_PUT?.heichelId;
    if (!seriesId) seriesId = $i.$_PUT?.seriesId;
    if (parentType === "comment" && !postId) postId = $i.$_PUT?.postId;
    if (verseSection === undefined || verseSection === null) verseSection = $i.$_PUT?.verseSection ?? "root";

    if (!newContent && !newDayuh) { // Check if new data provided in PUT body
        newContent = $i.$_PUT?.content;
        newDayuh = $i.$_PUT?.dayuh;
    }
    newDayuh = parseDayuhVessel(newDayuh);
     if (!userid) userid = $i.awtsmoosSession?.user?.id || $i.moch?.userid;

    // Basic validation
    if (!commentId || !aliasId || !parentType || !parentId || !heichelId || !seriesId) {
        return er("Missing required parameters for editComment", { commentId, aliasId, /*...*/ });
    }
    if (parentType === "comment" && !postId) {
         return er("postId is required when parentType is 'comment'");
    }
     if (!userid) return er(NO_LOGIN);
    if (newContent === undefined && newDayuh === undefined) {
        return er("No new content or dayuh provided for editing.", { code: "NO_EDIT_DATA" });
    }

    try {
		return await applyCommentEdit({ $i, commentId, aliasId, parentType, parentId, heichelId, postId, seriesId, verseSection, newContent, newDayuh, userid });

    } catch (e) {
        console.error(`Error editing comment ${commentId}:`, e);
         if (e.code === 'NOT_FOUND' || e.code === 404) {
            return er("Comment data source not found.", { code: "DB_READ_ERROR", details: e });
         }
        return er("Internal server error during comment edit.", { details: e.stack });
    }
}

module.exports = {
	editComment,
};
