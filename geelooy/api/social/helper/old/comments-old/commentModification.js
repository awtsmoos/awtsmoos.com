/**
 * B"H
 * Modification refines existence, elevating it through the Awtsmoos’s eternal renewal.
 */

const { 
    sp 
} = require("../../_awtsmoos.constants.js");

const { 
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
    
    getShtarPath
} = require("./commentPaths.js");

const { 
    addCommentIndexToAlias 
} = require("./commentCreation.js");

/**
 * @method editComment
 * @description Edits an existing comment.
 * @param {Object} params - Parameters for editing.
 * @returns {Object} Edit result.
 */
async function editComment(
    {
        $i,
        parentType = "post",
        parentId,
        heichelId,
        aliasId,
        commentId,
        userid,
        postId
    }
) {
    var aliasId = $i.$_PUT.aliasId;

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

    if (!parentType) {
        parentType = $i.$_PUT.parentType;
    }

    if (!parentId) {
        parentId = $i.$_PUT.parentId;
    }

    if (!commentId) {
        commentId = $i.$_PUT.commentId;
    }

    if (!commentId) {
        return er(
            {
                message: "Missing commentId"
            }
        );
    }

    var parent;

    if (parentType == "post") {
        var path = `${
            sp
        }/heichelos/${
            heichelId
        }/posts/${
            parentId
        }`;

        parent = await $i.db.access(path);

        if (!parent) {
            return er(
                {
                    message: "Post parent not found",
                    code: "PARENT_NOT_FOUND",
                    details: {
                        post: parentId,
                        heichelId: heichelId,
                        path
                    }
                }
            );
        }
    } else if (parentType == "comment") {
        // TODO: Add comment-to-comment logic if needed
    }

    if (!parent) {
        return er(
            {
                message: "No parent",
                code: "PARENT_NOT_FOUND"
            }
        );
    }

    var myId = commentId;

    var content = $i.$_PUT.content;

    var dayuh = $i.$_PUT.dayuh;

    var link = parentType == "post" ? "atPost" : "atComment";

    var existingPath = getShtarPath(
        {
            heichelId,
            link,
            parentId,
            aliasId,
            commentId: myId
        }
    );

    var existing = await $i.db.access(existingPath);

    if (!existing) {
        return er(
            {
                message: "That comment wasn't found",
                code: "COMMENT_NOT_FOUND",
                details: {
                    commentId,
                    heichelId
                }
            }
        );
    }

    var shtar = {};

    var printFull = $i.$_PUT.printFull;

    var fields = {};

    if (content && typeof content == "string") {
        shtar.content = content;
        fields.content = true;
    }

    if (dayuh && typeof dayuh == "object") {
        shtar.dayuh = dayuh;
        fields.dayuh = true;
    } else {
        fields.whatIsDayuh = dayuh;
    }

    var cm = await $i.db.write(
        existingPath, 
        shtar
    );

    return {
        message: "Edited comment!",
        details: {
            id: myId,
            fieldsWritten: fields,
            paths: {
                wrote: cm
            },
            shtar: printFull ? shtar : Object.keys(shtar)
        }
    };
}

/**
 * @method updateAllCommentIndexes
 * @description Updates all comment indexes for a heichel or parent.
 * @param {Object} params - Parameters for updating.
 * @returns {Object} Update result.
 */
async function updateAllCommentIndexes(
    {
        $i,
        aliasId,
        heichelId,
        parentId,
        postId,
        userid
    }
) {
    $i.response.setHeader('Transfer-Encoding', 'chunked');

    $i.response.setHeader('Connection', 'keep-alive');

    var t = $i.$_POST.testStreaming;

    if (t) {
        for (var i = 0; i < 9; i++) {
            await new Promise(r => setTimeout(() => { r(); }, 300));
            $i.response.write("WOW " + i);
        }

        $i.response.end("LOL");

        return;
    }

    try {
        var opts = myOpts($i);

        var owns = await verifyAliasOwnership(
            aliasId,
            $i,
            userid
        );

        if (!owns) {
            return er(
                {
                    message: "You don't have permission to post as this alias."
                }
            );
        }

        var parentType = $i.$_POST.parentType;

        var link = parentType == "post" ?
            "atPost" : parentType == "comment" ? "atComment" :
            null;

        if (!link) {
            return er(
                {
                    message: "You need to supply a parent type",
                    code: "MISSING_PARAMS",
                    detail: "parentType"
                }
            );
        }

        if (parentId) {
            var indexesDone = await updateCommentIndexesAtParent(
                {
                    parentId,
                    $i,
                    aliasId,
                    parentType,
                    heichelId,
                    userid
                }
            );

            return {
                success: {
                    indexesDone,
                    parentId,
                    parentType
                }
            };
        }

        var getParentIDsPath = `${
            sp
        }/heichelos/${
            heichelId
        }/comments/${link}`;

        var parentIDs = await $i.db.get(
            getParentIDsPath, 
            opts
        );

        if (!Array.isArray(parentIDs)) {
            return er(
                {
                    message: "Did not get array of IDs of parents",
                    code: "NO_PARENT_IDs",
                    detail: parentIDs
                }
            );
        }

        var parentsDone = [];

        for (var parentId of parentIDs) {
            var indexesDone = await updateCommentIndexesAtParent(
                {
                    parentId,
                    $i,
                    aliasId,
                    parentType,
                    userid,
                    heichelId
                }
            );

            parentsDone.push(
                {
                    parentId,
                    parentType,
                    aliasId,
                    indexesDone
                }
            );
        }

        return parentsDone;
    } catch (e) {
        return er(
            {
                message: "Internal update index error",
                details: e + "",
                code: 501
            }
        );
    }
}

/**
 * @method updateCommentIndexesAtParent
 * @description Updates comment indexes for a specific parent.
 * @param {Object} params - Parameters for updating.
 * @returns {Object} Update result.
 */
async function updateCommentIndexesAtParent(
    {
        $i,
        aliasId,
        parentId,
        parentType,
        postId,
        heichelId,
        userid
    }
) {
    var link = parentType == "post" ?
        "atPost" : parentType == "comment" ? "atComment" :
        null;

    if (!link) {
        return er(
            {
                message: "You need to supply a parent type",
                code: "MISSING_PARAMS",
                detail: "parentType"
            }
        );
    }

    var idPath = `${
        sp
    }/heichelos/${
        heichelId
    }/comments/${link}/${
        parentId
    }/author/${
        aliasId
    }`;

    var opts = myOpts($i);

    var IDs = await $i.db.get(
        idPath, 
        opts
    );

    if (!Array.isArray(IDs)) {
        return er(
            {
                message: "Did not get array of IDs",
                detail: IDs
            }
        );
    }

    var indexesDone = [];

    for (var id of IDs) {
        var index = await addCommentIndexToAlias(
            {
                parentId,
                heichelId,
                parentType,
                $i,
                userid,
                aliasId,
                commentId: id
            }
        );

        indexesDone.push(
            { 
                index 
            }
        );
    }

    return {
        success: {
            indexesDone,
            parentType,
            parentId,
            aliasId
        }
    };
}

module.exports = { 
    editComment, 
    updateAllCommentIndexes, 
    updateCommentIndexesAtParent 
};