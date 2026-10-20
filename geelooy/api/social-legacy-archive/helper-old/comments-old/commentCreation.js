/**
 * B"H
 * The Awtsmoos recreates all from nothing every instant, as per Chabad Chassidus Maamarim.
 * Here, comments are born, infused with the Ohr Ein Sof, channeled through the Kav into Atzilus.
 */

const { 
    NO_LOGIN, 
    sp 
} = require("../../_awtsmoos.constants.js");

const { 
    loggedIn, 
    er, 
    myOpts 
} = require("../../general.js");

const { 
    verifyHeichelAuthority 
} = require("../../heichel.js");

const { 
    verifyAliasOwnership 
} = require("../../alias.js");

const { 
    getSubmittedCommentPath, 
    commentsOfAliasByHeichelAndSeries,
    getShtarPath,
    getAliasesAtVerseSectionPath
} = require("./commentPaths.js");

/**
 * @method addComment
 * @description Initiates comment creation, verifying ownership and authority.
 * @param {Object} params - Parameters including $i, parentType, etc.
 * @returns {Object} Success or error response.
 */
async function addComment(
    {
        $i,
        parentType = "post",
        parentId,
        heichelId,
        aliasId,
        userid,
        postId
    }
) {
    try {
        if (!aliasId) aliasId = $i.$_POST.aliasId;

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

        var ver = await verifyHeichelAuthority(
            {
                heichelId,
                aliasId,
                $i
            }
        );

        if (!ver) {
            return await submitComment(
                {
                    $i,
                    parentType,
                    parentId,
                    heichelId,
                    aliasId,
                    userid,
                    postId
                }
            );

            return er(
                {
                    message: "You don't have authority to post to this heichel",
                    code: "NO_AUTH"
                }
            );
        }

        return await addOrApproveComment(
            {
                $i,
                parentType,
                parentId,
                heichelId,
                aliasId,
                userid,
                postId
            }
        );
    } catch (e) {
        return er(
            {
                details: e.stack
            }
        );
    }
}

/**
 * @method submitComment
 * @description Submits a comment for approval, storing it temporarily.
 * @param {Object} params - Parameters for submission.
 * @returns {Object} Submission result.
 */
async function submitComment(
    {
        $i,
        parentType,
        parentId,
        heichelId,
        aliasId,
        userid,
        postId
    }
) {
    const { 
        content, 
        dayuh 
    } = $i.$_POST;

    const db = $i.db;

    const timestamp = Date.now();

    const commentId = "BH_tempComment_by_" + aliasId + "_at_" + timestamp;

    const commentData = { 
        aliasId, 
        parentId, 
        parentType, 
        content, 
        dayuh, 
        timestamp 
    };

    const fullPath = await getSubmittedCommentPath(
        {
            parentType,
            heichelId,
            parentId,
            postId,
            commentId,
            $i,
            aliasId
        }
    );

    if (typeof fullPath != "string" || fullPath.error) {
        return fullPath;
    }

    const allSubmittedPath = `${sp}/heichelos/${heichelId}/comments/submitted/${
        parentType
    }/${
        parentId
    }`;

    commentData.awtsmoosDayuh = {
        BH: "Boruch Hashem",
        fullPath,
        submittedPath: allSubmittedPath,
        parentId,
        parentType,
        postId,
        commentAliasId: aliasId
    };

    await db.write(
        fullPath, 
        commentData.awtsmoosDayuh
    );

    await db.write(
        allSubmittedPath, 
        commentData
    );

    return { 
        success: true, 
        commentId, 
        fullPath, 
        allSubmittedPath 
    };
}

/**
 * @method addOrApproveComment
 * @description Core function to add or approve a comment.
 * @param {Object} params - Parameters for adding/approving.
 * @returns {Object} Result of operation.
 */
async function addOrApproveComment(
    {
        $i,
        parentType,
        parentId,
        heichelId,
        aliasId,
        userid,
        postId,
        seriesId,
        isApproval = false
    }
) {
    try {
        if (!parentType) {
            parentType = $i.$_POST.parentType;
        }

        if (!parentId) {
            parentId = $i.$_POST.parentId;
        }

        if(!seriesId) {
            seriesId = $i.$_POST.parentSeriesId ||
            $i.$_POST.seriesId;
        }

        if(!seriesId) {
            return er({
                message: "Need to supply the parent series "+
                "that this comment's parent is part of",
                code: "NO_SERIES"
            });
        }

        var link = parentType == "post" ?
            "atPost" : parentType == "comment" ?
            "atComment" : null;

        if (!link) {
            return er(
                {
                    message: "You need to supply a parent type",
                    code: "MISSING_PARAMS"
                }
            );
        }

        var postId = $i.$_POST.postId;

        var isPost = parentType = "post";

        var postId = isPost ? parentId : postId;

        if (!postId) {
            return er(
                {
                    message: "If commenting on post, provide parent ID." +
                        "If replying to comment in a larger post, provide parentId of comment and postId",
                    code: "MISSING_PARAMS",
                    details: "postId"
                }
            );
        }

        var path = `${
            sp
        }/heichelos/${
            heichelId
        }/posts/${
            postId
        }`;

        var post = await $i.db.access(path);

        if (!post) {
            return er(
                {
                    message: "Post parent not found",
                    code: "PARENT_NOT_FOUND",
                    details: {
                        post: postId,
                        heichelId: heichelId,
                        path
                    }
                }
            );
        }

        var myId = "BH_" + Date.now() + "_commentBy_" + aliasId;

        var content = $i.$_POST.content;

        var dayuh = $i.$_POST.dayuh;

        var shtar = {};
        shtar.id = myId;

        shtar.author = aliasId;

        shtar.parentType = parentType;

        shtar.parentId = parentId;

        if (content && typeof content == "string" && content != "undefined") {
            shtar.content = content;
        }

        if (dayuh && typeof dayuh == "object") {
            shtar.dayuh = dayuh;
        }

        var verseSection = shtar?.dayuh?.verseSection;

        if (!verseSection && verseSection !== 0) {
            verseSection = "root";
        }


        var postPath = getShtarPath(
            {
                heichelId,
                link,
                parentId,
                aliasId,
                verseSection,
                

                postId,
                seriesId,


                
            }
        );

        try {
            var wrote = await $i.db.arrayAppend(
                postPath, 
                shtar
            );

            if(wrote.error) {
                return er({
                    message: "Couldn't append message",
                    code: "NO_APPEND",
                    details: wrote
                })
            }
    
    
            var index = await addCommentIndexToAlias(
                {
                    parentId,
                    heichelId,
                    $i,
                    parentType,
                    postId,
                    userid,
                    aliasId,
                    commentId: myId,
                    postPath,
                    commentPostedAt: postPath,
                    verseSection,

                    seriesId,

                    shtar
                }
            );
    
            if (index.error) {
                return index.error;
            }
    
            return {
                message: "Added comment!",
                details: {
                    id: myId,
                    /*
                    setCommentIndex: index,
                    index,
                    wrote: {
                        parentId,
                        aliasId
                    },
                    paths: {
                        postPath
                    }*/
                }
            };
        } catch(e) {
            return er({
                message: "Issue appending new comment",
                code: "ISSUE_APPEND_COMMENT",
                details:e.stack
            })
        }
        
        
    } catch (e) {
        return er(
            {
                message: "Issue adding comment",
                details: e.stack
            }
        );
    }
}

/**
 * @method addCommentIndexToAlias
 * @description Indexes a comment under an alias.
 * @param {Object} params - Parameters for indexing.
 * @returns {Object} Indexing result.
 */
async function addCommentIndexToAlias(
    {
        parentId,
        parentType,
        userid,
        commentId,
        heichelId,
        postId,
        $i,
        aliasId,
        verseSection,
        commentPostedAt = null,
        seriesId,

        shtar
    }
) {

    try {
        if (!commentId) {
            return er(
                {
                    message: "You need to supply a commentId",
                    code: "MISSING_PARAMS",
                    details: "commentId"
                }
            );
        }

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

        var link = parentType == "post" ?
            "atPost" : parentType == "comment" ?
            "atComment" : null;

        if (!link) {
            return er(
                {
                    message: "You need to supply a parent type",
                    code: "MISSING_PARAMS"
                }
            );
        }

        var isPost = parentType == "post";

        if (isPost) {
            postId = parentId;
        } else if (!postId) {
            return er(
                {
                    message: "If you're commenting on another comment, need to provide postId",
                    code: "MISSING_PARAMS",
                    details: "postId"
                }
            );
        }

        

        var seriesParentId = seriesId;

        if (!seriesParentId) {
            return er(
                {
                    message: "That parent has no series parent provided"
                    +", not even root!",
                    code: "NO_PARENT",
                    details: {
                        parentType,
                        parentId,
                        post
                    }
                }
            );
        }



        

        var allSeriesThatAliasCommentedAtInHeichel = 
            commentsOfAliasByHeichelAndSeries({
                    aliasId,
                    heichelId
                });

                
        var sync = await $i.db.syncKeyInObj(
            allSeriesThatAliasCommentedAtInHeichel, 
            seriesId
        );

        if(sync?.error) {
             return er({
                k: sync
            });
        }

        var allAuthorsAtVerseSectionOfParent = 
            getAliasesAtVerseSectionPath({
                heichelId,
                link,
                parentId,
                verseSection,

                postId,
                seriesId
            });

        var aliasSync = await $i.db.syncKeyInObj(
            allAuthorsAtVerseSectionOfParent,
            aliasId
        );

        if(aliasSync?.error) return er({
            d: aliasSync
        })

        //commentId,

        return {
            success: {
                message: "Made comment index",
                parentId,
                parentType,
                verseSection,
                aliasId,
                sync,
                aliasSync
            }
        };
    } catch (e) {
        return er(
            {
                message: "Internal comment index error",
                details: e.stack
            }
        );
    }
}

module.exports = { 
    addComment, 
    submitComment, 
    addOrApproveComment, 
    addCommentIndexToAlias 
};