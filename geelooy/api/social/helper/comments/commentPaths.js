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
function getShtarPath({
    heichelId,
    parentId,
    link,
    aliasId,

    postId,
    seriesId,

    verseSection = "root"
}) {
    return `${
        getAuthorPath(
            {
                heichelId,
                parentId,
                link,
                aliasId,
				postId,
        		seriesId,
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
 * 
 * The expected output is simply a list 
 * of verseSections, if any comments exist.
 * 
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getAuthorPath({
    heichelId,
    parentId,
    link,
    postId,
    seriesId,
    aliasId
}) {
    return getAliasesCommentsPath({
		heichelId,
        parentId,
        link,
		postId,
        seriesId,
	}) + aliasId
    
}


/**
 * @method getAliasesCommentsPath
 * @description All aliases that left comment at specific parent.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getAliasesCommentsPath({
	heichelId,
	parentId,
	link,
	postId,
	seriesId
}) {
    return `${
        getParentPath({
            heichelId,
            parentId,
            link,
            postId,
            seriesId
        })
    }/author/`
}

function getParentPath({
    heichelId,
    parentId,
    link,
    postId,
    seriesId
}) {
    return `${
        sp
    }/heichelos/${
        heichelId
    }/comments/atSeries/${
		seriesId
    }/${
		link == "atPost" ?
        	link
		: link == "atComment" ?
			`atPost/${
				postId
			}/atComment` : "other"
    }/${
        parentId
    }`
}




/**
 * @method commentsOfAliasByHeichelAndSeries
 * @description Constructs path for verse section comments by an alias.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function commentsOfAliasByHeichelAndSeries(
    {
        aliasId,
        heichelId
    }
) {
    
    return `${
        sp
    }/aliases/${
        aliasId
    }/comments/heichel/${
        heichelId
    }/atSeries/`;
}


/**
 * @method getAliasesAtVerseSectionPath
 * @description Constructs path for an array of
 * aliases that left at least one comment
 * at this verse section.
 * @param {Object} params - Parameters for path construction.
 * @returns {String} Path string.
 */
function getAliasesAtVerseSectionPath(
    {
		heichelId,
		link,
		parentId,
		verseSection="root",

		postId,
		seriesId
    }
) {
    return `${
        getParentPath({
            heichelId,
            parentId,
            link,
            postId,
            seriesId
        })
    }/verseSection/${
        verseSection
    }/authors`;
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
	
    
	commentsOfAliasByHeichelAndSeries,

    getAliasesCommentsPath,
    
    getAliasesAtVerseSectionPath,
    getSubmittedCommentPath
};