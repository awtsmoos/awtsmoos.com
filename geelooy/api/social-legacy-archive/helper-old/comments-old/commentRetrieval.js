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
    getShtarPath,
    getAuthorPath
} = require("./commentPaths.js");



async function getArrayOfCommentsUnderWhichAliasCommentedAtSpecificVerseSectionInParent({
    $i,
    parentType="post",
    parentId,
    heichelId,
    postId,
    seriesId,
    aliasId,
    verseSection,
    onlyPath = false
}) {
    var opts = myOpts($i);
    if(!aliasId) {
        aliasId = $i.$_GET["aliasId"]
    }
    if(!aliasId) {
        return er({
            message: "Missing aliasId",
            code: "NO_ALIAS_ID"
        });
    }


    if(!seriesId) {
        seriesId = $i.$_GET.seriesId;
    }

    if(!seriesId) {
        return er({
            message: "Need to specify series that parent is part of",
            code: "NO_SERIES"
        })
    }
    if (!parentType) {
        parentType = $i.$_GET["parentType"] || "post";
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

    var needed = [
        "comment",
        "post"
    ];

    if (!needed.includes(parentType)) {
        return er(
            {
                message: "need parent type",
                specifically: needed
            }
        );
    }

    var link = parentType == "post" ? "atPost" : "atComment";
    verseSection = getVerseSection($i, verseSection)
    

    var pathToArrayThatShouldContainCommentsOfAliasUnderVerseSection =
        getShtarPath({
            heichelId,
            parentId,
            link,
            aliasId,

            postId,
            seriesId,

            verseSection
        });
    if(onlyPath) return pathToArrayThatShouldContainCommentsOfAliasUnderVerseSection;
    try {

        
        var ar = await $i
        .db
        .get(
            pathToArrayThatShouldContainCommentsOfAliasUnderVerseSection,
            opts
        );
        if(ar?.error) {
            throw ar.error;
        }
        if(ar) {
            return {
                success: ar
            }
        } else {
            return {
                error: {
                    message: "Couldn't get array",
                    code: "NO_ARRAY_OF_COMMENTS"
                }
            }
        }
    } catch(e) {
        return er({
            message: "Issue getting array of comments",
            code: "ISSUE_GETTING",
            details: e
        })
    }


}

async function getVerseSectionsCommentedByAuthorInParent({
    $i,
    parentType="post",
    parentId,
    heichelId,
    postId,
    seriesId,
    aliasId
}) {
    if(!aliasId) {
        aliasId = $i.$_GET["aliasId"]
    }
    if(!aliasId) {
        return er({
            message: "Missing aliasId",
            code: "NO_ALIAS_ID"
        });
    }

    if(!seriesId) {
        seriesId = $i.$_GET.seriesId;
    }

    if(!seriesId) {
        return er({
            message: "Need to specify series that parent is part of",
            code: "NO_SERIES"
        })
    }

    if (!parentType) {
        parentType = $i.$_GET["parentType"] || "post";
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

    var needed = [
        "comment",
        "post"
    ];

    if (!needed.includes(parentType)) {
        return er(
            {
                message: "need parent type",
                specifically: needed
            }
        );
    }

    var link = parentType == "post" ? "atPost" : "atComment";

    
    var verseSectionsUnderWhichThisAliasCommentedInParentPath = 
        getAuthorPath({
            heichelId,
            parentId,
            link,
            postId,
            seriesId,
            aliasId
        });
    var pathToRead = verseSectionsUnderWhichThisAliasCommentedInParentPath
    var verseSection = $i.$_GET.verseSection;
    if(verseSection !== undefined) {
        
        pathToRead += "/" +verseSection
    }

    try {
        var list = await $i
        .db
        .get(
            pathToRead
        );
        if(!list) {
            return er({
                message: "couldnt get",
                pathToRead
            })
        }
        if(list.success) {
            return list.success
            
        }
        return  list
    } catch(e) {
        return er({
            message: "System error getting list",
            code: "SYSTEM_ERROR",
            details:e
        });
    }

}

function getVerseSection($i, verseSection) {
    
    if(!verseSection && verseSection !== 0)
        verseSection = $i.$_GET["verseSection"];

    if (!verseSection && verseSection !== 0) {
        verseSection = "root";
    }
    return verseSection;
}
async function getAuthorsOfCommentsAtVerseSectionInParent({
    $i,
    parentType="post",
    parentId,
    heichelId,
    postId,
    seriesId,
    verseSection
}) {
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

    if(!seriesId) {
        seriesId = $i.$_GET.seriesId;
    }

    if(!seriesId) {
        return er({
            message: "Need to specify series that parent is part of",
            code: "NO_SERIES"
        })
    }

    var subPath = parentType == "post" ? "atPost" : "atComment";

    var link = subPath;

    
    verseSection = getVerseSection($i, verseSection)

    var authorsAtParentPath = getAliasesAtVerseSectionPath({
        heichelId,
        link,
        parentId,
        verseSection,

        postId,
        seriesId
    });

    try {
        var authorArray = await $i.db.get(authorsAtParentPath);
        if(authorArray?.success || Array.isArray(authorArray))
            return authorArray.success || authorArray
            
        else {
            return {
                error: {
                    messsage: "Couldn't find any authors",
                    code: "NO_AUTHORS",
                    pathChecked: authorsAtParentPath,
                    otherInfo: {
                        heichelId,
                        link,
                        parentId,
                        verseSection,
                        seriesId,
                        postId
                    }
                }
            }
        }
    } catch(e) {
        return er({
            message: "Couldn't get comments",
            details:e,
            code: "SYSTEM_ERROR"
        })
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
        seriesId,
        heichelId,
        parentType,
        parentId,
        aliasId,
        verseSection
    }
) {
   

    try {
        var commentSearchInCommentArrayOfAliasAtVerseSectionInParentPath =
            getArrayOfCommentsUnderWhichAliasCommentedAtSpecificVerseSectionInParent({
                $i,
                
                seriesId,
                heichelId,
                parentType,
                parentId,
                aliasId,
                seriesId,
                verseSection,
                onlyPath: true
            })
            
        
        if (commentSearchInCommentArrayOfAliasAtVerseSectionInParent?.error) {
            return er(
                {
                    message: "Couldn't find that comment!",
                    code: "NO_COMMENT",
                    details: {
                        commentId,
                        heichelId,
                        errorMsg: 
                        commentSearchInCommentArrayOfAliasAtVerseSectionInParent?.error
                    }
                }
            );
        }

        var actualComment = await $i.db.findInArray(
            commentSearchInCommentArrayOfAliasAtVerseSectionInParentPath,
            {
                    
                property: {
                    id: {
                        selfEquals: commentId
                    }
                }
                
                
            }
        )

        if(actualComment?.error) {
            return er({
                message: "Error finding comment ID in array",
                code: "NO_COMMENT",
                details: actualComment?.error
            })
        }

        return actualComment?.success;
    } catch (e) {
        return er(
            {
                message: "Server error",
                details: e
            }
        );
    }
}

module.exports = { 
    
    getComment, 
    
    getArrayOfCommentsUnderWhichAliasCommentedAtSpecificVerseSectionInParent,
    getVerseSectionsCommentedByAuthorInParent,
    getAuthorsOfCommentsAtVerseSectionInParent

};