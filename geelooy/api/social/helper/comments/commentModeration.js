/**
 * B"H
 * Moderation reflects the Awtsmoos’s discernment, sifting creation through Atzilus’s light.
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

        var commentAliasId = null;

        var {
            aliasId,
            parentId,
            parentType,
            postId,
            content,
            dayuh
        } = submittedComment;

        if (aliasId && !commentAliasId) {
            commentAliasId = aliasId;
        }

        if (!parentId || !parentType || !commentAliasId) {
            return er(
                {
                    message: "Invalid comment data. Missing ",
                    details: {
                        parentId,
                        parentType,
                        postId,
                        commentAliasId
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
                aliasId: commentAliasId
            }
        );

        $i.$_POST.content = content;

        $i.$_POST.dayuh = dayuh;

        $i.$_POST.aliasId = aliasId;

        var add = await addOrApproveComment(
            {
                $i,
                parentType,
                parentId,
                userid,
                heichelId,
                aliasId,
                postId
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
    } catch (e) {
        return er(
            {
                message: "Issue approving comment.",
                details: e.stack
            }
        );
    }
}

/**
 * @method denyComment
 * @description Denies and deletes a submitted comment.
 * @param {Object} params - Parameters for denial.
 * @returns {Object} Denial result.
 */
async function denyComment(
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

        if (!aliasId) {
            aliasId = $i.$_GET.aliasId;
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
                    message: "You don't have the authority to view submitted comments in this heichel.",
                    code: "NO_AUTH"
                }
            );
        }

        const fullPath = `${sp}/heichelos/${heichelId}/comments/submitted/all/${commentId}`;

        var submittedComment = await $i.db.get(
            fullPath,
            {
                propertyMap: {
                    awtsmoosDayuh: {
                        fullPath: true,
                        parentId: true,
                        parentType: true,
                        postId: true,
                        commentAliasId: true
                    }
                }
            }
        );

        var { 
            awtsmoosDayuh: {
                parentId,
                parentType,
                postId,
                commentAliasId
            } = {} 
        } = submittedComment;

        const submittedPath = await getSubmittedCommentPath(
            {
                parentType,
                heichelId,
                parentId,
                $i,
                postId,
                commentId,
                aliasId: commentAliasId
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
    } catch (e) {
        return er(
            {
                message: "Issue denying/deleting comment",
                details: e.stack
            }
        );
    }
}

/**
 * @method getSubmittedComments
 * @description Retrieves all submitted comments for moderation.
 * @param {Object} params - Parameters for retrieval.
 * @returns {Object} Retrieved comments or error.
 */
async function getSubmittedComments(
    {
        $i,
        heichelId,
        aliasId
    }
) {
    try {
        if (!aliasId) {
            aliasId = $i.$_GET.aliasId;
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
                    message: "You don't have the authority to view submitted comments in this heichel.",
                    code: "NO_AUTH"
                }
            );
        }

        const submittedCommentsPath = `${sp}/heichelos/${heichelId}/comments/submitted/all`;

        const submittedComments = await $i.db.get(submittedCommentsPath);

        if (!submittedComments || Object.keys(submittedComments).length === 0) {
            return {
                message: "No submitted comments found.",
                comments: []
            };
        }

        return {
            message: "Submitted comments retrieved successfully.",
            comments: submittedComments
        };
    } catch (e) {
        return er(
            {
                message: "Issue retrieving submitted comments.",
                details: e.stack
            }
        );
    }
}

module.exports = { 
    approveComment, 
    denyComment, 
    getSubmittedComments 
};