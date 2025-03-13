/**
 * B"H
 * Retrieval unveils the hidden, like the Awtsmoos revealing Ohr Ein Sof to the worlds.
 */

const { 
    sp 
} = require("../_awtsmoos.constants.js");

const { 
    er, 
    myOpts 
} = require("../general.js");

const { 
    
    getAliasCommentsPath, 
    
    getAliasesAtVerseSectionPath, 
    getShtarPath
} = require("./commentPaths.js");

/**
 * @method getComments
 * @description Retrieves comment IDs or mapped data for a parent or alias.
 * @param {Object} params - Parameters for retrieval.
 * @returns {Object} Comments or error.
 */
async function getComments(
    {
        $i,
        parentType = "post",
        parentId,
        heichelId,
        aliasParent = null
    }
) {
    var aliasId;

    try {
        var opts = myOpts($i);

        var map = $i.$_GET.map;

        var count = $i.$_GET.count;

        var postPar = $i.$_GET.parentType;

        if (!aliasParent) {
            aliasParent = $i.$_GET.aliasParent || $i.$_GET.aliasId;
        }

        aliasId = aliasParent;

        if (postPar) {
            parentType = postPar;
        }

        if (!parentType) {
            parentType = "post";
        }

        if (!parentId) {
            parentId = $i.$_GET.parentId;
        }

        if (!parentId) {
            return er(
                {
                    message: "need parent ID"
                }
            );
        }

        if (!parentType) {
            return er(
                {
                    message: "need parent type"
                }
            );
        }

        var subPath = parentType == "post" ? "atPost" : "atComment";

        var link = subPath;

        var verseSection = $i.$_GET["verseSection"] || "root";

        if (!verseSection && verseSection !== 0) {
            verseSection = "root";
        }

        if (!aliasParent) {
            var pth = `${
                sp
            }/heichelos/${
                heichelId
            }/comments/${subPath}/${
                parentId
            }/author`;

            var authorsOfVerseSection = getAliasesAtVerseSectionPath(
                {
                    heichelId,
                    subPath,
                    parentId,
                    verseSection
                }
            );

            var aliases = [];

            if (verseSection !== null) {
                aliases = await $i.db.get(
                    authorsOfVerseSection, 
                    opts
                );
            } else {
                aliases = await $i.db.get(
                    pth, 
                    opts
                );
            }

            if (!aliases) {
                return er(
                    {
                        message: "no comments yet!",
                        details: {
                            path: pth,
                            heichelId,
                            parentId,
                            parentType,
                            subPath
                        }
                    }
                );
            }

            if (!map) {
                return !count ? aliases : aliases.length;
            }

            var realAliases = [];

            for (var al of aliases) {
                var commentsOfAlias = await getCommentsOfAlias(
                    {
                        $i,
                        heichelId,
                        subPath,
                        parentId,
                        parentType,
                        aliasId: al,
                        map,
                        count,
                        verseSection,
                        opts
                    }
                );

                if (commentsOfAlias.length) {
                    var alObj = {
                        comments: commentsOfAlias,
                        id: al
                    };

                    realAliases.push(alObj);
                }
            }

            return !count ? realAliases : (realAliases.length + "");
        } else {
            var commentsOfAlias = await getCommentsOfAlias(
                {
                    $i,
                    heichelId,
                    subPath,
                    parentId,
                    parentType,
                    aliasId,
                    map,
                    count,
                    verseSection,
                    opts
                }
            );

            return commentsOfAlias;
        }
    } catch (e) {
        return er(
            {
                message: "error getting comments",
                stack: e.stack,
                details: {
                    aliasId,
                    parentType,
                    parentId,
                    heichelId
                }
            }
        );
    }
}

/**
 * @method getComment
 * @description Retrieves a specific comment by ID.
 * @param {Object} params - Parameters for retrieval.
 * @returns {Object} Comment data or error.
 */
async function getComment(
    {
        $i,
        commentId,
        heichelId,
        parentType,
        parentId,
        aliasId,
        seriesId
    }
) {
    if (!aliasId) {
        aliasId = $i.$_GET.aliasId;
    }

    if (!aliasId) {
        return er(
            {
                message: "No aliasId Provided!"
            }
        );
    }

    if (!parentType) {
        parentType = $i.$_GET.parentType;
    }

    if (!parentId) {
        parentId = $i.$_GET.parentId;
    }

    if (!parentId) {
        return er(
            {
                message: "No parentId Provided!"
            }
        );
    }

    if (!parentType) {
        return er(
            {
                message: "No parentType Provided!"
            }
        );
    }

    var opts = myOpts($i);

    var link = parentType == "post" ? "atPost" : "atComment";

    try {
        var chaiPath = getShtarPath(
            {
                heichelId,
                link,
                parentId,
                aliasId,

                verseSection,
                seriesId,

                
            }
        );
        //commentId
        var cm = await $i.db.get(
            chaiPath, 
            opts
        );

        if (!cm) {
            return er(
                {
                    message: "Couldn't find that comment!",
                    code: "NO_COMMENT",
                    details: {
                        commentId,
                        heichelId
                    }
                }
            );
        }

        return cm;
    } catch (e) {
        return er(
            {
                message: "Server error",
                details: e
            }
        );
    }
}

/**
 * @method getCommentsOfAlias
 * @description Retrieves comments for a specific alias.
 * @param {Object} params - Parameters for retrieval.
 * @returns {Object} Comments or count.
 */
async function getCommentsOfAlias(
    {
        $i,
        heichelId,
        link,
        parentId,
        parentType,
        seriesId,
        aliasId,
        map,
        count,
        verseSection="root",
        opts
    }
) {
    var aliasParent = aliasId;

    var commentPath = null;
    
    var shtarPath = getAliasCommentsPath(
        {
            heichelId,
            subPath,
            parentId,
            aliasId
        }
    );

    if (verseSection !== null) {
        var parent = null;

        if (parentType == "post") {
            parent = await $i.db.get(
                sp + `/heichelos/${
                    heichelId
                }/posts/${
                    parentId
                }`,
                {
                    propertyMap: {
                        parentSeriesId: true
                    }
                }
            );
        }

        if (!parent) {
            return er(
                {
                    message: "No parent with that id!",
                    details: {
                        parentId,
                        parentType,
                        aliasParent,
                        heichelId
                    }
                }
            );
        }

        var parentSeries = parent.parentSeriesId;

        if (!parentSeries) {
            return er(
                {
                    message: "No series in parent!",
                    details: {
                        parentId,
                        parent,
                        parentType,
                        aliasParent,
                        heichelId
                    }
                }
            );
        }

       /* commentPath = getCommentIDsAtVerseSectionPath(
            {
                aliasId,
                heichelId,
                parentSeries,
                link: subPath,
                parentId,
                verseSection
            }
        );

        */
    } else {
        commentPath = shtarPath;
    }

    
    var commentIDs = await $i.db.get(
        commentPath, 
        opts
    );

    if (!commentIDs) {
        return [];
    }

    if (!map) {
        return count ? commentIDs.length : commentIDs;
    }

    var mappedComments = [];

    for (var id of commentIDs) {
        var mainCommentPath = getShtarPath(
            {
                heichelId,
                link,
                parentId,
                aliasId,
                verseSection,
                seriesId
            }
        );
        //commentId
        var mainComment = await $i.db.get(
            mainCommentPath, 
            opts
        );

        if (!mainComment) {
            continue;
        }

        mainComment.id = id;

        mappedComments.push(mainComment);
    }

    return count ? mappedComments.length : mappedComments;
}

module.exports = { 
    getComments, 
    getComment, 
    getCommentsOfAlias 
};