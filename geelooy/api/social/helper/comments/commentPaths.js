/**
 * B"H
 * Paths are the Kav, structuring the Awtsmoos’s boundless light into form.
 */

const { 
    sp 
} = require("../_awtsmoos.constants.js");

const {
    er
} = require("../general.js")

/**
 * @method getShtarPath
 * @description Constructs path for a comment’s shtar (document)
 * at specific post or (parent) comment.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getShtarPath(
    {
        heichelId,
        parentId,
        link,
        aliasId,
        
        verseSection = "root"
    }
) {
    return `${
        getAuthorPath(
            {
                heichelId,
                parentId,
                link,
                aliasId
            }
        )
    }/${
        verseSection
    }`;
}




/**
 * @method getAuthorPath
 * @description Constructs path to an author’s comments on a parent
 * (post or other comment).
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getAuthorPath(
    {
        heichelId,
        parentId,
        link,
        aliasId
    }
) {
    return `${
        sp
    }/heichelos/${
        heichelId
    }/comments/${
        link
    }/${
        parentId
    }/author/${
        aliasId
    }`;
}

/**
 * @method getVerseSectionPath
 * @description Constructs path for comments in a verse section.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getVerseSectionPath(
    {
        heichelId,
        parentId,
        link,
        aliasId,
        commentId = null,
        verseSection
    }
) {
    return `${
        sp
    }/heichelos/${
        heichelId
    }/comments/${
        link
    }/${
        parentId
    }/verseSection/${
        verseSection
    }/author/${aliasId}${
        commentId != "null" ?
        "/" + commentId : ""
    }`;
}

/**
 * @method verseSectionsCommentPath
 * @description Constructs path for verse section comments by an alias.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function verseSectionsCommentPath(
    {
        aliasId,
        heichelId,
        seriesParentId,
        link,
        isPost,
        parentId,
        verseSection,
        postId
    }
) {
    if (!verseSection && verseSection !== 0) {
        verseSection = "root";
    }

    return `${
        sp
    }/aliases/${
        aliasId
    }/comments/heichel/${
        heichelId
    }/atSeries/${
        seriesParentId
    }/${
        isPost ? 
        `atPost` : `atPost/${
            postId
        }/atComment`
        
    }/${parentId}
    }/verseSection/${
        verseSection
    }`;
}

/**
 * @method makeCommentIndexPath
 * @description Constructs index path for a comment.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function makeCommentIndexPath(
    {
        aliasId,
        heichelId,
        seriesParentId,
        isPost,
        commentId,
        parentId,
        verseSection,
        postId
    }
) {
    return verseSectionsCommentPath(
        {
            aliasId,
            heichelId,
            seriesParentId,
            isPost,
            postId,
            parentId,
            verseSection
        }
    ) + "/" + commentId;
}

/**
 * @method getAliasCommentsPath
 * @description Constructs path for an alias’s comments.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getAliasCommentsPath(
    {
        heichelId,
        subPath,
        parentId,
        aliasId
    }
) {
    return `${
        sp
    }/heichelos/${
        heichelId
    }/comments/${subPath}/${
        parentId
    }/author/${
        aliasId
    }`;
}

/**
 * @method getCommentPath
 * @description Constructs path for a specific comment.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getCommentPath(
    {
        heichelId,
        subPath,
        parentId,
        aliasId,
        commentId
    }
) {
    return getAliasCommentsPath(
        {
            heichelId,
            subPath,
            parentId,
            aliasId
        }
    ) + `/${commentId}`;
}

/**
 * @method getCommentIDsAtVerseSectionPath
 * @description Constructs path for comment IDs in a verse section.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getCommentIDsAtVerseSectionPath(
    {
        aliasId,
        heichelId,
        parentSeries,
        link,
        parentId,
        verseSection
    }
) {
    return `${
        sp
    }/aliases/${
        aliasId
    }/comments/heichel/${
        heichelId
    }/atSeries/${
        parentSeries
    }/${link}/${
        parentId
    }/root/verseSection/${
        verseSection
    }`;
}

/**
 * @method getAliasesAtVerseSectionPath
 * @description Constructs path for aliases in a verse section.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getAliasesAtVerseSectionPath(
    {
        heichelId,
        subPath,
        parentId,
        verseSection
    }
) {
    return `${
        sp
    }/heichelos/${
        heichelId
    }/comments/${
        subPath
    }/${
        parentId
    }/verseSection/${
        verseSection
    }/author`;
}

/**
 * @method getSubmittedCommentPath
 * @description Constructs path for a submitted comment.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string or error.
 */
async function getSubmittedCommentPath(
    {
        parentType = "post",
        heichelId,
        parentId,
        postId,
        commentId,
        aliasId,
        $i
    }
) {
    var db = $i.db;

    let parentSeriesId = null;

    if (parentType == "comment" && !postId) {
        return er("postId is required when replying to a comment.");
    }

    var postPath = `${sp}/heichelos/${heichelId}/posts/${
        parentType === "post" ?
        parentId :
        postId
    }`;

    const post = await db.get(
        postPath,
        {
            propertyMap: {
                parentSeriesId: true
            }
        }
    );

    if (!post || !post.parentSeriesId) {
        return er(
            {
                message: "Invalid parent post or missing parentSeriesId.",
                details: {
                    postPath,
                    post
                }
            }
        );
    }

    parentSeriesId = post.parentSeriesId;

    const subPath = parentType === "post" ?
        `/atPost/${parentId}/${commentId}` :
        `/atComment/${parentId}/${commentId}`;

    return `${sp}/heichelos/${heichelId}/comments/submitted/${aliasId}/atSeries/${parentId}/comment/${commentId}`;
}

module.exports = { 
    
    getShtarPath,
    getAuthorPath,
    getVerseSectionPath,
    verseSectionsCommentPath,
    makeCommentIndexPath,
    getAliasCommentsPath,
    getCommentPath,
    getCommentIDsAtVerseSectionPath,
    getAliasesAtVerseSectionPath,
    getSubmittedCommentPath
};