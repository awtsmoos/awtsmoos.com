/**
 * B"H
 * Deletion clears the old, making way for the Awtsmoos’s infinite recreation.
 */

const { 
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
    getCommentPath, 
    verseSectionsCommentPath, 
    getVerseSectionPath, 
    makeCommentIndexPath 
} = require("./commentPaths.js");

/**
 * @method deleteComment
 * @description Deletes a specific comment.
 * @param {Object} params - Parameters for deletion.
 * @returns {Object} Deletion result.
 */
async function deleteComment(
    {
        $i,
        commentId,
        heichelId,
        parentId,
        parentType,
        aliasId
    }
) {
    if (!aliasId) {
        aliasId = $i.$_POST.aliasId || $i.$_DELETE.aliasId;
    }

    if (!parentId) {
        parentId = $i.$_POST.parentId || $i.$_DELETE.parentId;
    }

    if (!parentType) {
        parentType = $i.$_POST.parentType || $i.$_DELETE.parentType || "atPost";
    }

    var ver = await verifyHeichelAuthority(
        {
            heichelId,
            aliasId,
            $i
        }
    );

    if (!ver) {
        return er(
            {
                message: "You don't have authority to post to this heichel",
                code: "NO_AUTH",
                details: aliasId,
                parentId,
                parentType,
                heichelId
            }
        );
    }

    if (!parentId) {
        return er(
            {
                message: "No parent id provided",
                code: "MISSING_PARAMS",
                detail: "parentId"
            }
        );
    }

    var link = parentType == "post" ?
        "atPost" : parentType == "comment" ?
        "atComment" : "atPost";

    if (!link) {
        return er(
            {
                message: "No parent type provided",
                code: "MISSING_PARAMS",
                detail: "parentType"
            }
        );
    }

    try {
        var pth = `${
            sp
        }/heichelos/${
            heichelId
        }/comments/${link}/${
            parentId
        }/author/${
            aliasId
        }/${commentId}`;

        var res = await $i.db.get(
            pth,
            {
                propertyMap: {
                    author: true,
                    parentId: true,
                    dayuh: {
                        verseSection: true
                    }
                }
            }
        );

        var author = res?.author;

        var parentId = res?.parentId;

        var dayuh = res?.dayuh;

        if (!author || !parentId) {
            return er(
                {
                    message: "Didn't delete, couldn't find author or parentId",
                    code: "NO_AUTHOR_OR_PARENTID",
                    details: {
                        path: pth,
                        commentId,
                        author,
                        parentId,
                        heichelId
                    }
                }
            );
        }

        var verseSection = dayuh?.verseSection;

        if (!verseSection && verseSection !== 0) {
            verseSection = "root";
        }

        var delPost = null;

        var rest;

        var restPath = null;

        var authors = `${
            sp
        }/heichelos/${
            heichelId
        }/comments/${link}/${
            parentId
        }/author/${
            author
        }`;

        var deleteMore = [];

        var delIndex = null;

        var authPath = authors + `/${commentId}`;

        try {
            delIndex = await deleteCommentIndex(
                {
                    $i,
                    commentId,
                    aliasId,
                    heichelId,
                    parentId,
                    verseSection,
                    parentType
                }
            );

            if (delIndex.error) {
                return er(delIndex.error);
            }

            delPost = await $i.db.delete(authPath);

            deleteMore.push(
                await checkIfAllDeletedAndDeleteMore(
                    {
                        $i,
                        authPath
                    }
                )
            );

            rest = await $i.db.get(authors);

            if (!rest || rest.length == 0) {
                restPath = await $i.db.delete(authors);
            }

            deleteMore.push(
                await checkIfAllDeletedAndDeleteMore(
                    {
                        $i,
                        authors
                    }
                )
            );
        } catch (e) {
            return er(
                {
                    message: "Problem",
                    error: e.stack
                }
            );
        }

        return {
            success: {
                deleted: {
                    deleteMore,
                    delIndex,
                    entireAuthorSection: {
                        restPath,
                        rest
                    },
                    post: delPost,
                    postPath: authPath
                }
            }
        };
    } catch (e) {
        return er(
            {
                message: "Problem",
                error: e.stack
            }
        );
    }
}

/**
 * @method deleteAllCommentsOfAlias
 * @description Deletes all comments by a specific alias for a parent.
 * @param {Object} params - Parameters for deletion.
 * @returns {Object} Deletion result.
 */
async function deleteAllCommentsOfAlias(
    {
        $i,
        heichelId,
        parentId,
        author,
        parentType
    }
) {
    var aliasId = author;

    var ver = await verifyHeichelAuthority(
        {
            heichelId,
            aliasId,
            $i
        }
    );

    if (!ver) {
        return er(
            {
                message: "You don't have authority to post to this heichel",
                code: "NO_AUTH",
                aliasId,
                author
            }
        );
    }

    var link = parentType == "post" ?
        "atPost" : parentType == "comment" ?
        "atComment" : null;

    if (!link) {
        return er(
            {
                message: "No parent type provided",
                code: "MISSING_PARAMS",
                detail: "parentType"
            }
        );
    }

    var authors = `${
        sp
    }/heichelos/${
        heichelId
    }/comments/${link}/${
        parentId
    }/author/${
        author
    }`;

    var opts = myOpts($i);

    var authorInfo = await $i.db.get(
        authors,
        {
            pageSize: 1000000
        }
    );

    if (!authorInfo || !Array.isArray(authorInfo)) {
        return er(
            {
                message: "No comments found for that author",
                details: {
                    author,
                    heichelId,
                    parentId
                }
            }
        );
    }

    var results = [];

    for (var i = 0; i < authorInfo.length; i++) {
        var c = authorInfo[i];

        var res = await deleteComment(
            {
                $i,
                commentId: c,
                parentId,
                parentType,
                heichelId,
                aliasId
            }
        );

        results.push(
            {
                id: c,
                result: res
            }
        );
    }

    return {
        deleteStatus: results
    };
}

/**
 * @method deleteAllCommentsOfParent
 * @description Deletes all comments under a specific parent.
 * @param {Object} params - Parameters for deletion.
 * @returns {Object} Deletion result.
 */
async function deleteAllCommentsOfParent(
    {
        $i,
        heichelId,
        parentId,
        parentType
    }
) {
    var aliasId = $i.$_POST.aliasId || $i.$_DELETE.aliasId;

    var ver = await verifyHeichelAuthority(
        {
            heichelId,
            aliasId,
            $i
        }
    );

    if (!ver) {
        return er(
            {
                message: "You don't have authority to post to this heichel",
                code: "NO_AUTH"
            }
        );
    }

    var link = parentType == "post" ?
        "atPost" : parentType == "comment" ?
        "atComment" : null;

    if (!link) {
        return er(
            {
                message: "No parent type provided",
                code: "MISSING_PARAMS",
                detail: "parentType"
            }
        );
    }

    var authors = `${
        sp
    }/heichelos/${
        heichelId
    }/comments/${link}/${
        parentId
    }/author/`;

    var opts = myOpts($i);

    var authorInfo = await $i.db.get(
        authors, 
        opts
    );

    if (!authorInfo || !Array.isArray(authorInfo)) {
        return er(
            {
                message: "No comments found for that author",
                code: "NO_COM",
                details: {
                    heichelId,
                    parentId
                }
            }
        );
    }

    var results = [];

    for (var i = 0; i < authorInfo.length; i++) {
        var author = authorInfo[i];

        var res = await deleteAllCommentsOfAlias(
            {
                $i,
                heichelId,
                parentId,
                author,
                parentType
            }
        );

        results.push(
            {
                id: author,
                result: res
            }
        );
    }

    return {
        deleteStatus: results
    };
}

/**
 * @method checkIfAllDeletedAndDeleteMore
 * @description Recursively deletes empty directories.
 * @param {Object} params - Parameters for deletion.
 * @returns {Array} Paths deleted.
 */
async function checkIfAllDeletedAndDeleteMore(
    {
        $i,
        path,
        verseSectionPath,
        commentPath,
        authPath,
        pathsDone,
        authors
    }
) {
    var path = path || verseSectionPath || commentPath || authPath || authors;

    if (!path) {
        return;
    }

    path = path.split("/").filter(Boolean).join("/");

    try {
        var pathsDone = pathsDone || [];

        const content = await $i.db.get(path);

        if (content?.length === 0 || !content) {
            await $i.db.delete(path);

            pathsDone.push(path);

            const parentPath = path.substring(
                0, 
                path.lastIndexOf('/')
            );

            if (parentPath) {
                await checkIfAllDeletedAndDeleteMore(
                    {
                        $i,
                        path: parentPath,
                        pathsDone
                    }
                );
            }
        }
    } catch (error) {
        return er(
            {
                message: "path issue",
                error: error.stack
            }
        );
    }

    return pathsDone;
}

/**
 * @method deleteCommentIndex
 * @description Deletes a comment's index entry.
 * @param {Object} params - Parameters for deletion.
 * @returns {Object} Deletion result.
 */
async function deleteCommentIndex(
    {
        $i,
        commentId,
        parentId,
        verseSection,
        heichelId,
        aliasId,
        parentType,
        postId
    }
) {
    if (!parentType) {
        parentType = "post";
    }

    var link = parentType == "post" ?
        "atPost" : parentType == "comment" ?
        "atComment" : "atPost";

    if (!link) {
        return er(
            {
                message: "No parent type provided",
                code: "MISSING_PARAMS",
                detail: "parentType"
            }
        );
    }

    var parentSeriesId = null;

    if (parentType == "post") {
        parentSeriesId = await getParentSeriesId(
            {
                $i,
                heichelId,
                postId: parentId
            }
        );
    } else {
        parentSeriesId = await getParentSeriesId(
            {
                $i,
                heichelId,
                postId
            }
        );
    }

    if (!parentSeriesId) {
        return er(
            {
                message: "Couldnt find parent",
                code: "NO_PAR",
                details: {
                    parentType,
                    parentId,
                    commentId,
                    heichelId,
                    aliasId
                }
            }
        );
    }

    if (!postId) {
        if (link == "atPost") {
            postId = parentId;
        }
    }

    var commentPath = makeCommentIndexPath(
        {
            aliasId,
            heichelId,
            seriesParentId: parentSeriesId,
            isPost: parentType == "post",
            postId,
            commentId,
            parentId,
            verseSection
        }
    );

    var numVerses = verseSectionsCommentPath(
        {
            aliasId,
            heichelId,
            seriesParentId: parentSeriesId,
            isPost: parentType == "post",
            verseSection
        }
    );

    var num = await $i.db.get(numVerses);

    var count = num?.length || 0;

    if (count > 0) {
        count--;
    }

    var verseSectionPath = getVerseSectionPath(
        {
            heichelId,
            parentId,
            commentId,
            link,
            aliasId,
            verseSection
        }
    );

    var done = {
        deleteMore: []
    };

    done.deletedVerseSection = await $i.db.delete(verseSectionPath);

    done.deleteMore.push(
        await checkIfAllDeletedAndDeleteMore(
            {
                $i,
                verseSectionPath
            }
        )
    );

    done.commentPathDeleted = await $i.db.delete(commentPath);

    done.deleteMore.push(
        await checkIfAllDeletedAndDeleteMore(
            {
                $i,
                commentPath
            }
        )
    );

    return done;
}

/**
 * @method getParentSeriesId
 * @description Retrieves the parent series ID of a post.
 * @param {Object} params - Parameters for retrieval.
 * @returns {String} Parent series ID.
 */
async function getParentSeriesId(
    {
        $i,
        heichelId,
        postId
    }
) {
    var post = await $i.db.get(
        `/social/heichelos/${
            heichelId
        }/posts/${postId}`,
        {
            propertyMap: {
                parentSeriesId: true
            }
        }
    );

    return post.parentSeriesId;
}

module.exports = { 
    deleteComment, 
    deleteAllCommentsOfAlias, 
    deleteAllCommentsOfParent, 
    checkIfAllDeletedAndDeleteMore,
    deleteCommentIndex // Added to exports
};