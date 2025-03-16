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
    getAllVerseSectionsThatHaveAtLeastOneAuthorPath,
    commentsOfAliasByHeichelAndSeries,

    getShtarPath,
    getAuthorPath,

    getAliasesCommentsPath,
    
    getAliasesAtVerseSectionPath,

    getParentPath,
    getListOfPostsOrInSeriesPath


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
        aliasId,
        seriesId,
        postId,
        verseSection
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

    if(!seriesId) {
        seriesId = $i.$_POST.seriesId || 
            $i.$_DELETE.seriesId;
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

    if(link == "atComment") {
        if(!postId) {
            postId = $i.$_POST.postId || 
                $i.$_DELETE.postId;
        }

        if(!postId) {
            return er({
                message: "If commenting on comment need to "
                    +"provide post ID as well",
                code: "NO_POST_ID"
            })
        }
    } else {
        postId = parentId;
    }



    if (!verseSection && verseSection !== 0) {
        verseSection = $i.$_POST.verseSection || 
            $i.$_DELETE.verseSection;
    }

    if (!verseSection && verseSection !== 0) {
        verseSection = "root";
    }


    
    try {
        /**
         * First, need to delete
         * shtar path (
         * path where it shows array
         * of all comments alias made
         * at versesection in post
         * in series.
         * )
         * 
         * since it's an array
         * we just "remove" or "splice"
         * that specific array element
         * from the array that has 
         * id that matches the comment id
         */
        var pth = getShtarPath({
            heichelId,
            parentId,
            link,
            aliasId,
        
            postId,
            seriesId,
        
            verseSection
        });

        

        var pathsDeleted = [];
        
        var isVerseSectionArrayOfMyAliasEmpty = false;
        try {
            var delElementInArray = await $i.db.removeElementFromArray(
                pth, {
                    
                    property: {
                        id: {
                            selfEquals: commentId
                        }
                    }
                    
                    
                }, {
                    deleteSelfIfEmpty: true
                }
            );
            if(delElementInArray?.error) {
                return er({
                    message: "Couldn't delete comment!",
                    code: "NO_DELETE",
                    pathTried: pth,
                    commentId
                })
            }
            var inp = delElementInArray?.success?.inputArray;
            isVerseSectionArrayOfMyAliasEmpty = delElementInArray?.success?.isEmpty;
            

            var deletedParent = null;
            if(!inp?.length) {
                //we need to delete the parent 
                //directory since the array ran out
                var del = await $i.db.delete(pth);
                if(del.error) {
                    return er({
                        message: {
                            comment: "Couldn't delete parent",
                            code: "NO_PAR_DELETE",
                            details: del.error
                        }
                    });
                }
                deletedParent = del.success;

            }
            pathsDeleted.push({
                removed: true,
                delElementInArray,
                isVerseSectionArrayOfMyAliasEmpty,
                path: pth,
                deletedParent
            });

        } catch(e) {
            return er({
                message: "Couldn't delete comment!",
                code: "SYSTEM_ERROR_NO_DELETE",
                path: pth,
                details: e
            })
        }

        /**
         * Now that we removed the 
         * comment from it's array
         * we need to delete the 
         * other reference to it
         * next reference:
         * 
         * getAliasesAtVerseSectionPath
         * 
         it keeps track of how many 
         aliases have at least one 
         comment at that 
         verse section.

         Since we just removed one of the verse section
         comments from this alias,
         we need to determine if 
         the alias has any more comments in THAT
         verse section.

         By default when removing an 
         element with db it should tell u if its empty,
         and if it is it should automatically
         delete the reference itself (if specified, which it is).

         So we just read the property teling us if its completely deleted.

         If so, we remove the reference from 
         getAliasesAtVerseSectionPath for that alias.


         */


         var areThereNoMoreAliasesThatLeftAnyCommentsAtAllInThisVerseSection = false;
         if(isVerseSectionArrayOfMyAliasEmpty === true) {
            /**
             * this means we just deleted
             * a comment of our aliasId at a 
             * specific verse section,
             * which was an element in 
             * an array on disk,
             * and now that array self 
             * deleted, so we need to remove 
             * the reference that earlier implied
             * that this alias left a comment
             * at this verse section
             */
            var arrayOfAliasIDsThatLeftAtLeastOneCommentAtThisVerseSectionPath = 
            getAliasesAtVerseSectionPath({
                heichelId,
                link,
                parentId,
                verseSection,

                postId,
                seriesId
            });
            var pth = arrayOfAliasIDsThatLeftAtLeastOneCommentAtThisVerseSectionPath;

            var deletedVerseSectionReferenceOfAlias = await $i
                .db.removeElementFromArray(
                    pth, {
                        
                        exact: {
                            selfEquals: aliasId

                        } /**
                        just means a schema
                        to search for the aliasId string
                        in the array that matches
                        ("self equals") our aliasId.
                        */
                        
                        
                    }, {
                        deleteSelfIfEmpty: true
                    }
                );

            if(deletedVerseSectionReferenceOfAlias?.error) {
                return er({
                    message: "System error when deleting verse section reference",
                    code: "SYSTEM_DELETE_ERROR",
                    details: deletedVerseSectionReferenceOfAlias.error
                });
            }

            var suc = deletedVerseSectionReferenceOfAlias?.success

            var isEmpty = suc?.isEmpty;
            areThereNoMoreAliasesThatLeftAnyCommentsAtAllInThisVerseSection =
                isEmpty;
            pathsDeleted.push({
                removed: true,
                deletedVerseSectionReferenceOfAlias,
                arrayOfAliasIDsThatLeftAtLeastOneCommentAtThisVerseSectionPath,
                areThereNoMoreAliasesThatLeftAnyCommentsAtAllInThisVerseSection
            });




        }

        var anyRemainingVerseSectionsAtAllThatHaveAnyCommentsFromAnyoneInThisParent
            = true
        if(
            areThereNoMoreAliasesThatLeftAnyCommentsAtAllInThisVerseSection
        ) {
            /**
             * this means that
             * in the current verse section
             * we were checking,
             * not only did we remove just our 
             * own aliasId reference but 
             * in this case it must have been
             * that that was the last
             * alias id that left
             * any comment on THIS specific verse 
             * section, then that 
             * verse seciton path self
             * deleted itself (since it's an array written on disk)
             * IF it was empty, which it is in this condition.
             * 
             * Now, we need to determine if that 
             * was the last verseSection reference
             * that was written to at all.
             * 
             * Maybe there are no more comments on ANY
             * verse sections in any way.
             */
            var checked = checkVerseSectionsAndDeleteAllIfEmpty({
                $i,
                heichelId,
                parentId,
                link,
                postId,
                seriesId
            });
            if(checked.error) {
                return er({
                    message: "Couldn't check verse sections",
                    code: "VERSE_SECTION_ISSUE",
                    details: checked.error
                });
            }
            var suc = checked.success;
            anyRemainingVerseSectionsAtAllThatHaveAnyCommentsFromAnyoneInThisParent
                = suc
                .anyRemainingVerseSectionsAtAllThatHaveAnyCommentsFromAnyoneInThisParent
            pathsDeleted.push(suc);
//allPotentialCommentsOfAliasAtAllVerseSectionsInParent

        }

        


        /**
         * now that we removed any potential 
         * verse section references if 
         * we were the last ones,
         * we now need to check
         * the other references if OUR 
         * alias left any more comments in 
         * any verse section in this post,
         * which would only be true 
         * IF we didn't just remove
         * ALL references to all verse sections 
         * everywhere entirely.
         * 
         */
        var removedEntireAliasReference = false;
        if(
            anyRemainingVerseSectionsAtAllThatHaveAnyCommentsFromAnyoneInThisParent
        ) {
            /**
             * If there are still any
             * verse sections at all,
             * maybe those verse sections
             * are from our own alias.
             */

            var checked = await 
            checkIfOurAliasIdHasAnyMoreCommentsOnAnyVerseSectionInParent({
                $i,
                heichelId,
                parentId,
                link,
                postId,
                seriesId,
                aliasId
            });

            if(checked.error) {
                return er({
                    message: "Couldn't check verse sections",
                    code: "VERSE_SECTION_ISSUE",
                    details: checked.error
                });
            }
            var suc = checked.success;
            removedEntireAliasReference = 
            suc.anyRemainingVerseSectionsThatOurAliasHas;

            pathsDeleted.push({
                removedEntireAliasReference,
                checked
            });
        }

        var removedAllAliasesInAuthorSection = false;

        //getParentPath
        if(removedEntireAliasReference) {
            /**
             * IF we just removed
             * the entire reference 
             * to our alias in our comment data,
             * then we need to check
             * if we have any remaining 
             * alias references for that
             * parent at all.
             */
            var pathOfAllPossibleRemainingAliasesInParent = 
            getAliasesCommentsPath({
                heichelId,
                parentId,
                link,
                postId,
                seriesId
            });

            var count = await $i.db.count(
                pathOfAllPossibleRemainingAliasesInParent
            );
            if(count.error) {
                return er({
                    message: "System error in counting parent",
                    code: "SYSTEM_COUNT_ERROR",
                    detail: count.error
                });
            }
            count = count?.success || 0;
            if(count == 0) {
                /**
                 * now we have to remove that entire
                 * folder
                 */
                var allAuthorsDeleted = await $i.db.delete(
                    pathOfAllPossibleRemainingAliasesInParent
                );
                if(allAuthorsDeleted.error) {
                    return er({
                        message: "System issue in deleting parent folder",
                        code: "SYSTEM_DELETE_ERROR",
                        details: allAuthorsDeleted.error
                    });
                }

                pathsDeleted.push({
                    pathOfAllPossibleRemainingAliasesInParent,
                    allAuthorsDeleted
                });

                removedAllAliasesInAuthorSection = true;
            }


        }

        if(removedAllAliasesInAuthorSection) {
            /**
             * if we literally just removed ALL
             * aliases on this parent
             * (which means there are NO remaining comments on it at all)
             * then we need to delete the entire parent path
             */
            var pathOfParentWithAbsolutelyNoCommentatorsInAnyWay =
            getParentPath({
                heichelId,
                parentId,
                link,
                postId,
                seriesId
            });

            var deletedParent = await $i.db.delete(
                pathOfParentWithAbsolutelyNoCommentatorsInAnyWay
            );
            if(deletedParent.error) {
                return er({
                    message: "System issue deleting parent path",
                    code: "SYSTEM_ERROR_DELETE",
                    details: deletedParent.error
                })
            };
            
            pathsDeleted.push({
                pathOfParentWithAbsolutelyNoCommentatorsInAnyWay,
                deletedParent
            });

        }


        return {
            success: {
                pathsDeleted,
                parentType,
                seriesId,
                postId,
                verseSection

            }
        }

       
    } catch (e) {
        return er(
            {
                message: "Problem",
                error: e.stack
            }
        );
    }
}


async function checkifFolderIsEmptyAtPathAndDeleteItIfSo(path, $i) {

    try {
        var remaining = "possibly some";
      
        remaining = await $i.db.count(
            path
        );

        if(remaining.error) {
            return {
                error: {
                    message: "System error counting remaining verse sections",
                    details: remaining.error,
                    code: "SYSTEM_ERROR"
                }
            };
        }

        
        remaining = remaining.success;
        
        if(
            typeof(remaining) == "number" &&
            remaining === 0
        ) {
       
            /**
             * If theres no more
             * verse section entries,
             * not even root,
             * that means we need to 
             * remove all of the references entirely.
             * 
             */
            var deleteVerseSectionReferences =
            await $i.db.delete(
                path
            );
            if(deleteVerseSectionReferences.error) {
                return er({
                    message: "Couldn't remove alias parent reference",
                    code: "NO_REMOVE",
                    isEmpty: true,
                    pathTried: path
                })
            }
            
            return ({
                success: {
                    allPotentialVerseSectionReferencesInParent,
                    deleteVerseSectionReferences,
                    isEmpty: true,
                    pathDeleted:path
                }
            })


        }
    } catch(e) {
        return er({
            message: "Issue checking and deleting verse sections",
            code: "VERSE_SECTION_ISSUE",
            details: e.stack
        });
    }
}

async function checkIfOurAliasIdHasAnyMoreCommentsOnAnyVerseSectionInParent({
    $i,
    heichelId,
    parentId,
    link,
    postId,
    seriesId,
    aliasId
}) {

    var anyPotentialRemainingVerseSectionsThatWeCommentedAtPath = 
        getAuthorPath({
            heichelId,
            parentId,
            link,
            postId,
            seriesId,
            aliasId
            
        });

    try {

        var checkAndMaybeRemove = 
        await checkifFolderIsEmptyAtPathAndDeleteItIfSo(
            anyPotentialRemainingVerseSectionsThatWeCommentedAtPath,
            $i
        );
        

        if(checkAndMaybeRemove.error) {
            return checkAndMaybeRemove;
        }

        
        var anyRemainingVerseSectionsThatOurAliasHas =
            checkAndMaybeRemove?.isEmpty;
        
            /**
             * If theres no more
             * verse section entries,
             * not even root,
             * that means we need to 
             * remove all of the references entirely.
             * 
             */
            
            
        return ({
            success: {
                allPotentialVerseSectionReferencesInParent,
                deleteVerseSectionReferences,
                anyRemainingVerseSectionsThatOurAliasHas,
                anyPotentialRemainingVerseSectionsThatWeCommentedAtPath
            }
        })


        
    } catch(e) {
        return er({
            message: "Issue checking and deleting verse sections",
            code: "VERSE_SECTION_ISSUE",
            details: e.stack
        });
    }

}


async function checkVerseSectionsAndDeleteAllIfEmpty({
    $i,
    heichelId,
    parentId,
    link,
    postId,
    seriesId
}) {
    var allPotentialVerseSectionReferencesInParent = 
            getAllVerseSectionsThatHaveAtLeastOneAuthorPath({
                heichelId,
                parentId,
                link,
                postId,
                seriesId
                
            });

    try {

        var checkAndMaybeRemove = 
        await checkifFolderIsEmptyAtPathAndDeleteItIfSo(
            anyPotentialRemainingVerseSectionsThatWeCommentedAtPath,
            $i
        );
        

        if(checkAndMaybeRemove.error) {
            return checkAndMaybeRemove;
        }

        
        var noMoreVerseSectionsAtAllThatHaveAnyCommentsFromAnyoneInThisParent =
            checkAndMaybeRemove?.isEmpty;
        
            /**
             * If theres no more
             * verse section entries,
             * not even root,
             * that means we need to 
             * remove the parent.
             * 
             */
        if(noMoreVerseSectionsAtAllThatHaveAnyCommentsFromAnyoneInThisParent) {
            var pf = await deleteParentFolder({
                $i,
                heichelId,
                seriesId,
                parentType,
                parentId,
                postId,
                link
            });
            if(pf.error) return pf;
            pathsDeleted.push({
                noMoreVerseSectionsAtAllThatHaveAnyCommentsFromAnyoneInThisParent,
                parentDeleted:pf
            });
            if(parentType == "post") {
                var rm = removeSeriesFromAliasListReference({
                    aliasId,
                    heichelId,
                    seriesId,
                    $i
                });
                if(rm.error) return rm;
                pathsDeleted.push({
                    removedSeriesFromAliasReference: rm
                })
            }
        }
    
            
            
        return ({
            success: {
                pathsDeleted
            }
        })


        
    } catch(e) {
        return er({
            message: "Issue checking and deleting verse sections",
            code: "VERSE_SECTION_ISSUE",
            details: e.stack
        });
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
        seriesId,
        postId,
        author,
        parentType
    }
) {
    return {doesntWork:"yet IYH"};

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
        parentType,
        seriesId,
        postId
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

    var allAliasesAtParent = 
    getAliasesCommentsPath({
        heichelId,
        parentId,
        link,
        postId,
        seriesId
    });

    var aliasList = await $i.db.get(
        allAliasesAtParent
    );
    
    var pf = await deleteParentFolder({
        $i,
        heichelId,
        seriesId,
        parentType,
        parentId,
        postId,
        link
    });

    if(pf.error) {
        return pf;
    }

    var empty = pf?.success?.isEmpty;
    if(empty) {
        if(parentType == "post") {
            for(var aliasId of aliasList) {
                var rm = await removeSeriesFromAliasListReference({
                    aliasId,
                    seriesId,
                    $i,
                    heichelId
                });
                if(rm.error) {
                    return rm;
                }
            }
        }
    }



    return {
        deleteStatus: results
    };
}

async function removeSeriesFromAliasListReference({
    aliasId,
    seriesId,
    $i,
    heichelId
}) {
    var pathOfAliasSeriesReference = 
    commentsOfAliasByHeichelAndSeries({
        aliasId,
        heichelId
    });

    var rem = await $i.db.removeElementFromArray(
        pathOfAliasSeriesReference, {
            exact: {
                selfEquals: seriesId
            }
        }, {
            deleteSelfIfEmpty: true
        }
    );

    return rem;

}

async function deleteParentFolder({
    $i,
    heichelId,
    seriesId,
    parentType,
    parentId,
    postId,
    link
}) {
    var parentPath = 
    getParentPath({
        heichelId,
        seriesId,
        parentType,
        parentId,
        postId,
        link
    });

    if(typeof(parentPath) != "string") {
        return;
    }
    var delPar = await $i.db.delete(
        parentPath
    );
    if(delPar.error) {
        return delPar;
    }
    var holderOfParentPath =
        getListOfPostsOrInSeriesPath({
            heichelId,
            seriesId,
            postId,
            link
        });
        
    var del = await checkifFolderIsEmptyAtPathAndDeleteItIfSo(
        holderOfParentPath, $i
    );
    
    return del;
}

module.exports = { 
    deleteComment, 
    deleteAllCommentsOfAlias, 
    deleteAllCommentsOfParent
};