//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModerationApprove
 * @description RESIDUE: approveComment is one indivisible verbatim function (split from commentModeration.js).
 */

const { 
    sp 
} = require("../_awtsmoos.constants.js");

const { 
    er 
} = require("../general.js");

const { 
    verifyHeichelAuthority 
} = require("../heichel.js");

const { 
    verifyAliasOwnership 
} = require("../alias.js");

const { 
    getSubmittedCommentPath 
} = require("./commentPaths.js");

const {
    addOrApproveComment
} = require("./commentCreation.js")
	const { moveApprovedComment } = require("./commentModerationApproveMove.js");


/**
 * @method approveComment
 * @description Approves a submitted comment, moving it to its proper place.
 * @param {Object} params - Parameters for approval.
 * @returns {Object} Approval result.
 */
async function approveComment(
    {
        $i,
        heichelId,
        aliasId,
        commentId,
        userid
    }
) {
    try {
        var owns = await verifyAliasOwnership(
            aliasId,
            $i,
            userid
        );

        if (!owns) {
            return er(
                {
                    message: "You don't have permission to post as this alias.",
                    details: {
                        aliasId,
                        userid
                    }
                }
            );
        }

        const isAuthorized = await verifyHeichelAuthority(
            { 
                heichelId, 
                aliasId, 
                $i 
            }
        );

        if (!isAuthorized) {
            return er(
                {
                    message: "You don't have the authority to approve comments in this heichel.",
                    code: "NO_AUTH"
                }
            );
        }

        const submittedCommentPath = `${sp}/heichelos/${heichelId}/comments/submitted/all/${commentId}`;

        const submittedComment = await $i.db.get(submittedCommentPath);

        if (!submittedComment) {
            return er(
                {
                    message: "Submitted comment not found.",
                    code: "NOT_FOUND",
                    details: {
                        submittedCommentPath
                    }
                }
            );
        }

		return await moveApprovedComment({ $i, heichelId, commentId, userid, submittedComment, submittedCommentPath });
    } catch (e) {
        return er(
            {
                message: "Issue approving comment.",
                details: e.stack
            }
        );
    }
}

module.exports = {
	approveComment,
};
