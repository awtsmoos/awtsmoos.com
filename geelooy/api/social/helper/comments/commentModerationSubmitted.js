//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentModerationSubmitted
 * @description Submitted comment retrieval (split from commentModeration.js, verbatim).
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
	getSubmittedComments,
};
