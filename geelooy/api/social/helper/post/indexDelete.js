//B"H
//Blessed is He
//Boruch Hashem
/**
 * Post deletion and deletion-task compilation (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { er } = require("../general.js");
const { verifyHeichelAuthority } = require("../heichel.js");
const { invalidateSeries } = require("./seriesReadCache.js");

/**
 * @description Deletes a post from its parent series by unlinking it immediately
 * and scheduling a background job for comprehensive cleanup.
 * @requires $_DELETE: { aliasId }
 * @requires params: heichelId, seriesId, postId
 */
async function deletePostFromSeries({ $i, heichelId, seriesId, postId, userid }) {
    const aliasId = $i.$_POST.aliasId || $i.$_DELETE.aliasId;
    if (!aliasId) return er({ code: "MISSING_PARAMS", details: "Requires aliasId" });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;

    try {
        // --- 1. FAST, USER-FACING ACTION: Unlink the post ---
        await $i.db.deleteEntry(seriesPostsPath, postId);

        // --- 2. SLOW, BACKGROUND ACTION: Compile and schedule the cleanup job ---
        const tasks = await compileDeletionTasksForSinglePost({ $i, heichelId, seriesId, postId, authorAliasId: aliasId });

        // --- THE FIX: Use the new, simple $i.createJob method ---
        const { jobId } = await $i.createJob({
            description: `Full cleanup for deleted post '${postId}' from series '${seriesId}'.`,
            tasks: tasks,
            requestedBy: aliasId
        });

        try { invalidateSeries(heichelId, seriesId); } catch (e2) { /* ignore */ }

        return { 
            success: { 
                message: "Post has been unlinked. A background job has been scheduled for full cleanup.",
                jobId: jobId 
            } 
        };

    } catch (e) {
        console.error("Error in deletePostFromSeries:", e);
        return er({ code: "POST_DELETE_FAILED", details: e.message, stack: e.stack });
    }
}

/**
 * @description Compiles a list of tasks for the background worker to fully
 * delete a post's associated data (comments and all tracking references).
 */
async function compileDeletionTasksForSinglePost({ $i, heichelId, seriesId, postId }) {
    const tasks = [];
    
    // Task 1: Delete the entire comment hierarchy for this post.
    const commentsPath = `/social/heichelos/${heichelId}/comments/atSeries/${seriesId}/atPost/${postId}`;
    tasks.push({
        operation: 'DELETE_PATH',
        params: { path: commentsPath }
    });

    // Task 2: Find and delete the author's "postsSubmitted" tracking record.
    try {
        const postData = await $i.db.getValue(`${sp}/heichelos/${heichelId}/series/${seriesId}/posts`, postId);
        const authorAliasId = postData ? postData.author : null;

        if (authorAliasId) {
            // We have the author, now we need the breadcrumb to build the tracking path.
            const breadcrumb = await $i.fetchAwtsmoos(`/api/social/heichelos/${heichelId}/series/${seriesId}/breadcrumb`);
            if (Array.isArray(breadcrumb) && breadcrumb.length > 0) {
                const crumbPath = breadcrumb.map(c => c.id).join("/");
                const trackingPath = `${sp}/aliases/${authorAliasId}/postsSubmitted/inHeichel/${heichelId}/seriesChain/${crumbPath}`;
                
                // Add the task to delete the tracking entry for this specific post
                tasks.push({
                    operation: 'DELETE_ENTRY',
                    params: { 
                        path: trackingPath,
                        key: postId 
                    }
                });
            }
        }
    } catch (e) {
        console.error(`Could not generate post tracking cleanup task for ${postId}:`, e.stack);
    }

    return tasks;
}

module.exports = {
	deletePostFromSeries,
	compileDeletionTasksForSinglePost,
};
