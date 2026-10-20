//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModerationDeny
 * @description RESIDUE: denyComment is one indivisible verbatim function (split from commentModeration.js).
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
	const { deleteDeniedComment } = require("./commentModerationDenyDelete.js");


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

		return await deleteDeniedComment({ $i, heichelId, commentId, fullPath });
    } catch (e) {
        return er(
            {
                message: "Issue denying/deleting comment",
                details: e.stack
            }
        );
    }
}

module.exports = {
	denyComment,
};
