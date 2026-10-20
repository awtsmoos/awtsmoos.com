//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModerationDenyDelete
 * @description Loads and deletes a denied submitted comment (seam-split from commentModerationDeny.js).
 */

	const { er } = require("../general.js");
	const { getSubmittedCommentPath } = require("./commentPaths.js");

async function deleteDeniedComment({ $i, heichelId, commentId, fullPath }) {
        var submittedComment = await $i.db.get(
            fullPath,
            {
                propertyMap: {
                    awtsmoosDayuh: {
                        fullPath: true,
                        parentId: true,
                        parentType: true,
                        postId: true,
                        commentAliasId: true,
                        seriesId: true
                    },
                    seriesId: true
                }
            }
        );

        if (!submittedComment) {
            return er(
                {
                    message: "Submitted comment not found.",
                    code: "NOT_FOUND",
                    details: {
                        fullPath
                    }
                }
            );
        }

        var { 
            seriesId: directSeriesId,
            awtsmoosDayuh: {
                parentId,
                parentType,
                postId,
                commentAliasId,
                seriesId: dayuhSeriesId
            } = {} 
        } = submittedComment;

        var seriesId = directSeriesId || dayuhSeriesId;

        const submittedPath = await getSubmittedCommentPath(
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

        var submitted = await $i.db.delete(submittedPath);

        var full = await $i.db.delete(fullPath);

        return {
            success: true,
            message: "Denied and deleted comment reference successfully!",
            deleted: {
                submitted,
                full
            }
        };
}

module.exports = {
	deleteDeniedComment,
};
