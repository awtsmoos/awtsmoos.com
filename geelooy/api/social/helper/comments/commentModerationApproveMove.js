//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModerationApproveMove
 * @description Moves an approved submitted comment to its parent and deletes the submission (seam-split from commentModerationApprove.js).
 */

	const { er } = require("../general.js");
	const { getSubmittedCommentPath } = require("./commentPaths.js");
	const { addOrApproveComment } = require("./commentCreation.js");

async function moveApprovedComment({ $i, heichelId, commentId, userid, submittedComment, submittedCommentPath }) {
        var commentAliasId = null;

        var {
            aliasId,
            parentId,
            parentType,
            postId,
            seriesId,
            content,
            dayuh
        } = submittedComment;

        if (aliasId && !commentAliasId) {
            commentAliasId = aliasId;
        }

        if (!parentId || !parentType || !commentAliasId || !seriesId) {
            return er(
                {
                    message: "Invalid comment data. Missing ",
                    details: {
                        parentId,
                        parentType,
                        postId,
                        commentAliasId,
                        seriesId
                    },
                    code: "DATA_CORRUPT"
                }
            );
        }

        if (parentType == "post") {
            postId = parentId;
        }

        var commentDataPath = await getSubmittedCommentPath(
            {
                parentType,
                heichelId,
                parentId,
                $i,
                postId,
                commentId,
                aliasId: commentAliasId,
                seriesId
            }
        );

        $i.$_POST.content = content;

        $i.$_POST.dayuh = dayuh;

        $i.$_POST.aliasId = commentAliasId;

        $i.$_POST.seriesId = seriesId;

        var add = await addOrApproveComment(
            {
                $i,
                parentType,
                parentId,
                userid,
                heichelId,
                aliasId: commentAliasId,
                postId,
                seriesId
            }
        );

        var fullSubmittedPath = await $i.db.delete(submittedCommentPath);

        var detailedIndex = await $i.db.delete(commentDataPath);

        return {
            message: "Comment approved and moved to its parent.",
            details: {
                commentId,
                deleted: {
                    fullSubmittedPath,
                    detailedIndex
                },
                added: add
            }
        };
}

module.exports = {
	moveApprovedComment,
};
