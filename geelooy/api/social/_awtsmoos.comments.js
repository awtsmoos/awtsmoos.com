
/*B"H*/

// Import constants
var {
    NO_LOGIN,
    sp,
} = require("./helper/_awtsmoos.constants.js");

// Import refactored comment helper functions
var {
    // Creation
    addComment,
    // submitComment, // Called internally by addComment if needed
    // addOrApproveComment, // Called internally

    // Retrieval
    getComment,
    getCommentsByAliasAtVerseSection, // Renamed/Refactored
    getVerseSectionsCommentedByAuthorInParent, // Same name, refactored internals
    getAuthorsCommentingAtVerseSectionInParent, // Renamed/Refactored

    // Modification
    editComment,

    // Deletion
    deleteComment,
    deleteAllCommentsOfAlias,
    deleteAllCommentsOfParent,

    // Submission / Approval (Assuming these helpers were also updated or will be)
    // Note: approveComment should likely call the new addOrApproveComment internally
    getSubmittedComments,
    approveComment,
    denyComment,

    // Indexing (Simplified / Potentially Obsolete)
    addCommentIndexToAlias, // Simplified signature
    updateAllCommentIndexes, // Likely obsolete, kept as requested

} = require("./helper/index.js"); // Assuming index.js exports the right functions

// Import general utilities
var {
    loggedIn,
    er,
    myOpts
} = require("./helper/general.js");


module.exports = ({
    $i, // The request context object
    userid, // User ID performing the action
} = {}) => ({

    // --- Submission/Approval Routes (Largely Unchanged Externally) ---
    // GET /heichelos/:heichel/submittedComments
    "/heichelos/:heichel/submittedComments": async vars => {
        if ($i.request.method == "GET") {
            // Assuming getSubmittedComments is still valid or updated separately
            return await getSubmittedComments({
                heichelId: vars.heichel,
                $i
            });
        } else {
            return er({ message: "Method Not Allowed", code: 405 });
        }
    },

    // POST /heichelos/:heichel/submittedComments/approve
    "/heichelos/:heichel/submittedComments/approve": async vars => {
        var commentId = $i.$_POST.commentId || $i.$_GET.commentId;
        var aliasId = $i.$_POST.aliasId || $i.$_GET.aliasId;

        if (!commentId || !aliasId) {
            return er({ message: "Need commentId and aliasId", code: "MISSING_ARGS" });
        }

        if ($i.request.method == "POST") {
            // Critical: approveComment helper MUST be updated internally to:
            // 1. Fetch the submitted comment data.
            // 2. Extract necessary context (parentId, parentType, postId, seriesId, etc.).
            // 3. Call the *new* addOrApproveComment with isApproval=true and the context.
            // 4. Delete the submitted comment entry upon success.
            return await approveComment({ // Assuming this helper is adapted
                heichelId: vars.heichel,
                $i,
                userid,
                aliasId,
                commentId
            });
        } else {
            return er({ message: "Method Not Allowed", code: 405 });
        }
    },

    // POST /heichelos/:heichel/submittedComments/deny
    "/heichelos/:heichel/submittedComments/deny": async vars => {
        var commentId = $i.$_POST.commentId || $i.$_GET.commentId;
        var aliasId = $i.$_POST.aliasId || $i.$_GET.aliasId;

        if (!commentId || !aliasId) {
            return er({ message: "Need commentId and aliasId", code: "MISSING_ARGS" });
        }

        if ($i.request.method == "POST") {
            // Assuming denyComment simply deletes the submitted entry
            return await denyComment({
                heichelId: vars.heichel,
                $i,
                aliasId,
                userid,
                commentId
            });
        } else {
            return er({ message: "Method Not Allowed", code: 405 });
        }
    },

    // --- Comment Routes ---

    /**
     * GET /heichelos/:heichel/post/:post/comments/aliases
     * Get all alias IDs that left a comment at a specific post in a series.
     * Requires GET params: seriesId, [verseSection (optional, default='root')]
     */
    "/heichelos/:heichel/post/:post/comments/aliases": async vars => {
        if ($i.request.method == "GET") {
            const seriesId = $i.$_GET.seriesId;
            const verseSection = $i.$_GET.verseSection; // Handled by helper if undefined

            if (!seriesId) {
                return er({ message: "Missing required GET parameter: seriesId", code: "MISSING_PARAMS" });
            }

            return await getAuthorsCommentingAtVerseSectionInParent({ // Renamed function
                $i,
                heichelId: vars.heichel,
                parentType: "post",
                parentId: vars.post,
                postId: vars.post, // For posts, postId is the same as parentId
                seriesId: seriesId,
                verseSection: verseSection // Pass along, helper defaults to 'root'
            });
        } else {
            return er({ message: "Method Not Allowed", code: 405 });
        }
    },

    /**
     * /heichelos/:heichel/post/:post/comments/
     * POST: Leave a comment directly on a post.
     * PUT: Edit a comment on the post (requires full context in body).
     * DELETE: Delete ALL comments on the post (requires seriesId in body).
     * GET: Not allowed (use specific alias endpoint or /aliases).
     */
    "/heichelos/:heichel/post/:post/comments/": async vars => {
        if ($i.request.method == "GET") {
            // Explicitly disallow fetching all comments this way
            return er({
                BH: "B\"H",
                message: "Cannot GET all comments directly. Use '/aliases' endpoint to find authors, then '/aliases/:alias' to get their verse sections.",
                code: "WRONG_ENDPOINT",
            });
        } else if ($i.request.method == "POST") {
            // Requires POST body: seriesId, content/dayuh, [aliasId (if not inferred)]
            const seriesId = $i.$_POST.seriesId;
             const aliasId = $i.$_POST.aliasId; // Allow override or inference

            if (!seriesId) {
                return er({ message: "Missing required POST parameter: seriesId", code: "MISSING_PARAMS" });
            }
             if (!aliasId) {
                 // Maybe infer from session? Or require explicitly? For now, require.
                  return er({ message: "Missing required POST parameter: aliasId", code: "MISSING_PARAMS" });
             }


            return await addComment({
                $i,
                heichelId: vars.heichel,
                parentId: vars.post,
                postId: vars.post, // For post parent, postId = parentId
                userid,
                parentType: "post",
                seriesId: seriesId, // New required param
                 aliasId: aliasId      // Pass explicit aliasId
            });
        } else if ($i.request.method == "PUT") {
            // Requires PUT body: commentId, aliasId, seriesId, verseSection, content/dayuh
            const { commentId, aliasId, seriesId, verseSection, content, dayuh } = $i.$_PUT;

            if (!commentId || !aliasId || !seriesId || verseSection === undefined) {
                 return er({ message: "Missing required PUT parameters: commentId, aliasId, seriesId, verseSection", code: "MISSING_PARAMS" });
            }
             if (content === undefined && dayuh === undefined) {
                  return er({ message: "Missing new data for edit: content or dayuh", code: "MISSING_PARAMS" });
             }

            return await editComment({
                $i,
                heichelId: vars.heichel,
                parentType: "post",
                parentId: vars.post,
                postId: vars.post,
                userid,
                commentId: commentId,   // From body
                aliasId: aliasId,       // From body
                seriesId: seriesId,     // From body
                verseSection: verseSection, // From body
                newContent: content,    // From body
                newDayuh: dayuh         // From body
            });
        } else if ($i.request.method == "DELETE") {
            // Requires DELETE body: seriesId
             const seriesId = $i.$_DELETE?.seriesId || $i.$_POST?.seriesId; // Allow in POST body too for forms

             if (!seriesId) {
                 return er({ message: "Missing required DELETE/POST parameter: seriesId", code: "MISSING_PARAMS" });
             }
             // Make sure userid is passed for authorization checks inside the helper
             const requestingUserid = userid || $i.awtsmoosSession?.user?.id;
             if (!requestingUserid) return er(NO_LOGIN);

            return await deleteAllCommentsOfParent({
                $i,
                heichelId: vars.heichel,
                parentId: vars.post,
                postId: vars.post,
                parentType: "post",
                seriesId: seriesId, // New required param from body
                 userid: requestingUserid // Pass userid for auth checks
            });
        } else {
            return er({ message: "Method Not Allowed", code: 405 });
        }
    },

    /**
     * /heichelos/:heichel/post/:post/comments/aliases/:alias
     * GET: Get verse sections commented on by this alias on this post. (Requires GET param: seriesId)
     * POST: Add comment as this alias on this post. (Requires POST param: seriesId, content/dayuh)
     * DELETE: Delete all comments by this alias on this post. (Requires DELETE param: seriesId)
     */
    "/heichelos/:heichel/post/:post/comments/aliases/:alias": async vars => {
        if ($i.request.method == "GET") {
            // Requires GET param: seriesId
            const seriesId = $i.$_GET.seriesId;
            if (!seriesId) {
                return er({ message: "Missing required GET parameter: seriesId", code: "MISSING_PARAMS" });
            }

            return await getVerseSectionsCommentedByAuthorInParent({
                $i,
                aliasId: vars.alias,
                parentType: "post",
                parentId: vars.post,
                heichelId: vars.heichel,
                postId: vars.post,
                seriesId: seriesId // New required param
            });

        } else if ($i.request.method == "POST") {
            // Requires POST body: seriesId, content/dayuh
            const seriesId = $i.$_POST.seriesId;
            if (!seriesId) {
                return er({ message: "Missing required POST parameter: seriesId", code: "MISSING_PARAMS" });
            }

            return await addComment({
                $i,
                heichelId: vars.heichel,
                parentId: vars.post,
                postId: vars.post,
                aliasId: vars.alias, // From route
                parentType: "post",
                userid,
                seriesId: seriesId // New required param
            });
        } else if ($i.request.method == "DELETE") {
            // Requires DELETE body: seriesId
             const seriesId = $i.$_DELETE?.seriesId || $i.$_POST?.seriesId; // Allow in POST body too
             if (!seriesId) {
                 return er({ message: "Missing required DELETE/POST parameter: seriesId", code: "MISSING_PARAMS" });
             }
             // Pass userid for auth checks
             const requestingUserid = userid || $i.awtsmoosSession?.user?.id;
              if (!requestingUserid) return er(NO_LOGIN);

            return await deleteAllCommentsOfAlias({
                $i,
                heichelId: vars.heichel,
                parentId: vars.post,
                postId: vars.post,
                aliasId: vars.alias, // Renamed from 'author'
                parentType: "post",
                userid: requestingUserid, // Pass userid for auth checks
                seriesId: seriesId // New required param
            });
        } else {
            return er({ message: "Method Not Allowed", code: 405 });
        }
    },


    /**
     * GET /heichelos/:heichel/comments/inSeries/:series/atPost/:post/atAlias/:alias/atVerseSection/:verseSection
     * Gets array of comments left by alias in post at a specific verseSection.
     */
    [
        "/heichelos/:heichel/comments/inSeries/"
        + ":series/atPost/:post/atAlias/:alias/atVerseSection/:verseSection"
    ]: async vars => {
        if ($i.request.method == "GET") {
            return await getCommentsByAliasAtVerseSection({ // Renamed function
                $i,
                heichelId: vars.heichel, // Pass heichelId
                parentType: "post",
                parentId: vars.post,
                postId: vars.post, // Explicitly add postId
                aliasId: vars.alias,
                verseSection: vars.verseSection,
                seriesId: vars.series
            });
        } else {
            return er({ message: "GET only request", code: "GET_ONLY" });
        }
    },

    /**
     * GET /heichelos/:heichel/comments/inSeries/:series/atPost/:post/atComment/:comment/atAlias/:alias/atVerseSection/:verseSection
     * Gets array of comments left by alias in COMMENT at a specific verseSection.
     */
    [
        "/heichelos/:heichel/comments/inSeries/"
        + ":series/atPost/:post/atComment/:comment/"
        + "atAlias/:alias/atVerseSection/:verseSection"
    ]: async vars => {
        if ($i.request.method == "GET") {
            return await getCommentsByAliasAtVerseSection({ // Renamed function
                $i,
                heichelId: vars.heichel, // Pass heichelId
                parentType: "comment",
                postId: vars.post,      // Included
                parentId: vars.comment, // Included
                aliasId: vars.alias,
                verseSection: vars.verseSection,
                seriesId: vars.series
            });
        } else {
            return er({ message: "GET only request", code: "GET_ONLY" });
        }
    },

    /**
     * GET /heichelos/:heichel/comments/inSeries/:series/atPost/:post/atComment/:comment/aliases
     * Get list of aliases that commented under a specific comment.
     * Requires GET params: [verseSection (optional, default='root')]
     */
    [
        "/heichelos/:heichel/comments/inSeries/"
        + ":series/atPost/:post/atComment/:comment/aliases"
    ]: async vars => {
        if ($i.request.method == "GET") {
             const verseSection = $i.$_GET.verseSection; // Optional

            return await getAuthorsCommentingAtVerseSectionInParent({ // Renamed function
                $i,
                parentType: "comment",
                parentId: vars.comment,
                heichelId: vars.heichel,
                seriesId: vars.series,
                postId: vars.post,
                 verseSection: verseSection // Pass along, helper defaults
            });
        } else {
            return er({ message: "Method Not Allowed", code: 405 });
        }
    },

    /**
     * /heichelos/:heichel/comment/:comment
     * GET: Get a specific comment by ID (Requires full context in GET params).
     * POST: Reply to this comment (Requires POST body: postId, seriesId, content/dayuh, [aliasId]).
     * DELETE: Delete this comment (Requires DELETE body: aliasId, parentType, parentId, postId, seriesId, verseSection).
     * PUT: Edit this comment (Requires PUT body: aliasId, parentType, parentId, postId, seriesId, verseSection, content/dayuh).
     */
    "/heichelos/:heichel/comment/:comment": async vars => {
        if ($i.request.method == "GET") {
            // PROBLEM: This route only provides commentId & heichelId.
            // The new getComment needs full context (alias, parent, post, series, verse).
            // This context MUST be provided via GET parameters.
            const { aliasId, parentType, parentId, postId, seriesId, verseSection } = $i.$_GET;

            if (!aliasId || !parentType || !parentId || !seriesId || verseSection === undefined) {
                 return er({
                    message: "Cannot GET comment by ID alone. Full context required in GET parameters.",
                    details: "Need: aliasId, parentType, parentId, seriesId, verseSection (and postId if parentType='comment')",
                    code: "MISSING_CONTEXT"
                });
            }
             // postId required only if parentType is comment, validation inside getComment
             if (parentType === 'comment' && !postId) {
                  return er({ message: "GET param postId required when parentType is 'comment'", code: "MISSING_PARAMS" });
             }


            return await getComment({
                $i,
                heichelId: vars.heichel,
                commentId: vars.comment,
                // --- Context from GET params ---
                aliasId: aliasId,
                parentType: parentType,
                parentId: parentId,
                postId: postId, // May be undefined if parentType='post'
                seriesId: seriesId,
                verseSection: verseSection
            });
        } else if ($i.request.method == "POST") {
            // Replying to comment vars.comment
            // Requires POST body: postId, seriesId, content/dayuh, [aliasId]
            const { postId, seriesId, aliasId } = $i.$_POST;

            if (!postId || !seriesId) {
                return er({ message: "Missing required POST parameters: postId, seriesId", code: "MISSING_PARAMS" });
            }
             if (!aliasId) {
                  return er({ message: "Missing required POST parameter: aliasId", code: "MISSING_PARAMS" });
             }

            return await addComment({
                $i,
                heichelId: vars.heichel,
                parentId: vars.comment, // The comment being replied to
                parentType: "comment",
                userid,
                postId: postId,     // From body - the original post
                seriesId: seriesId, // From body
                 aliasId: aliasId      // From body
            });
        } else if ($i.request.method == "DELETE") {
            // Requires DELETE body: aliasId, parentType, parentId, postId, seriesId, verseSection
            const { aliasId, parentType, parentId, postId, seriesId, verseSection } = $i.$_DELETE || $i.$_POST; // Allow in POST body too

            if (!aliasId || !parentType || !parentId || !seriesId || verseSection === undefined) {
                 return er({ message: "Missing required DELETE/POST parameters: aliasId, parentType, parentId, seriesId, verseSection", code: "MISSING_PARAMS" });
            }
             // postId required only if parentType is comment
             if (parentType === 'comment' && !postId) {
                  return er({ message: "Parameter postId required when parentType is 'comment'", code: "MISSING_PARAMS" });
             }
             // Pass userid for auth checks
             const requestingUserid = userid || $i.awtsmoosSession?.user?.id;
             if (!requestingUserid) return er(NO_LOGIN);


            return await deleteComment({
                $i,
                heichelId: vars.heichel,
                userid: requestingUserid,
                commentId: vars.comment, // From route
                // --- Context from body ---
                aliasId: aliasId,
                parentType: parentType,
                parentId: parentId,
                postId: postId, // May be undefined if parentType='post'
                seriesId: seriesId,
                verseSection: verseSection
            });
        } else if ($i.request.method == "PUT") {
            // Requires PUT body: aliasId, parentType, parentId, postId, seriesId, verseSection, content/dayuh
             const { aliasId, parentType, parentId, postId, seriesId, verseSection, content, dayuh } = $i.$_PUT;

             if (!aliasId || !parentType || !parentId || !seriesId || verseSection === undefined) {
                  return er({ message: "Missing required PUT parameters: aliasId, parentType, parentId, seriesId, verseSection", code: "MISSING_PARAMS" });
             }
              if (parentType === 'comment' && !postId) {
                   return er({ message: "Parameter postId required when parentType is 'comment'", code: "MISSING_PARAMS" });
              }
              if (content === undefined && dayuh === undefined) {
                   return er({ message: "Missing new data for edit: content or dayuh", code: "MISSING_PARAMS" });
              }
              // Pass userid for auth checks
             const requestingUserid = userid || $i.awtsmoosSession?.user?.id;
             if (!requestingUserid) return er(NO_LOGIN);


            return await editComment({
                $i,
                heichelId: vars.heichel,
                userid: requestingUserid,
                commentId: vars.comment, // From route
                // --- Context from body ---
                aliasId: aliasId,
                parentType: parentType,
                parentId: parentId,
                postId: postId, // May be undefined if parentType='post'
                seriesId: seriesId,
                verseSection: verseSection,
                newContent: content,
                newDayuh: dayuh
            });
        } else {
            return er({ message: "Method Not Allowed", code: 405 });
        }
    },

    /**
     * POST /heichelos/:heichel/comments
     * Generic endpoint to add a comment.
     * Requires POST body: parentType, parentId, seriesId, content/dayuh, [aliasId], [postId (if parentType='comment')]
     */
    "/heichelos/:heichel/comments": async vars => {
        if ($i.request.method == "POST") {
            const { parentType, parentId, seriesId, aliasId, postId } = $i.$_POST;

            if (!parentType || !parentId || !seriesId) {
                 return er({ message: "Missing required POST parameters: parentType, parentId, seriesId", code: "MISSING_PARAMS" });
            }
             if (parentType === 'comment' && !postId) {
                  return er({ message: "POST parameter postId required when parentType is 'comment'", code: "MISSING_PARAMS" });
             }
             if (!aliasId) {
                 return er({ message: "Missing required POST parameter: aliasId", code: "MISSING_PARAMS" });
            }


            return await addComment({
                $i,
                heichelId: vars.heichel,
                userid,
                // --- From body ---
                parentType: parentType,
                parentId: parentId,
                postId: postId, // Required if parentType is comment
                seriesId: seriesId,
                 aliasId: aliasId
            });
        } else {
            // GET not suitable here
            return er({ message: "POST only endpoint", code: "METHOD_NOT_ALLOWED" });
        }
    },


    // --- Indexing Routes (Review for Obsolescence) ---

    /**
     * POST /heichelos/:heichel/aliases/:alias/commentsActions/addCommentIndexToAlias/comment/:comment
     * Manually trigger indexing (simplified).
     * Requires POST body: seriesId
     * Note: The commentId in the route is now irrelevant for the simplified index function.
     */
    "/heichelos/:heichel/aliases/:alias/commentsActions/addCommentIndexToAlias/comment/:comment": async vars => {
        if ($i.request.method == "POST") {
            // The new index function only cares about the series level.
            const seriesId = $i.$_POST.seriesId;
            // const parentId = $i.$_POST.parentId; // No longer needed by addCommentIndexToAlias
            // const parentType = $i.$_POST.parentType; // No longer needed by addCommentIndexToAlias

            if (!seriesId) {
                return er({ message: "Missing required POST parameter: seriesId", code: "MISSING_PARAMS" });
            }

            // Pass userid for potential future permission checks in helper
            const requestingUserid = userid || $i.awtsmoosSession?.user?.id;
            // if (!requestingUserid) return er(NO_LOGIN); // Auth check might be good practice

            try {
                // Call the simplified index function
                return await addCommentIndexToAlias({
                    $i,
                    userid: requestingUserid, // Pass for potential auth/logging
                    aliasId: vars.alias,
                    heichelId: vars.heichel,
                    seriesId: seriesId // The only required context now
                });
            } catch (e) {
                return er({ message: "Error in adding index", details: e + "" });
            }
        } else {
            return er({ message: "POST only request", code: "GET_ONLY" });
        }
    },

    /**
     * POST /heichelos/:heichel/aliases/:alias/commentsActions/updateAllCommentIndexes
     * Likely obsolete function due to structural changes. Kept for compatibility if needed.
     * May require review of its internal logic.
     */
    "/heichelos/:heichel/aliases/:alias/commentsActions/updateAllCommentIndexes": async vars => {
        if ($i.request.method == "POST") {
             // Pass userid for potential permission checks in helper
             const requestingUserid = userid || $i.awtsmoosSession?.user?.id;
             if (!requestingUserid) return er(NO_LOGIN);

             // These parameters were for the old logic, likely ignored now.
             // const parentType = $i.$_POST.parentType;
             // const parentId = $i.$_POST.parentId;

             // Call the potentially obsolete function
             console.warn("Calling updateAllCommentIndexes - this function may be obsolete or ineffective with the new data structure.");
            try {
                return await updateAllCommentIndexes({
                    $i,
                    userid: requestingUserid,
                    aliasId: vars.alias,
                    heichelId: vars.heichel,
                    // parentId, // Likely ignored
                    // parentType // Likely ignored
                });
            } catch (e) {
                return er({ message: "Error in updating indexes", details: e + "" });
            }
        } else {
            // Provide info if GET request is made
            return {
                message: "Use POST. Note: This endpoint is likely obsolete due to data structure changes.",
                apiInfo: "Original intent was to rebuild potentially complex indexes. This is likely no longer necessary."
            };
        }
    },
})
//--- END OF FILE _awtsmoos.comments.js ---