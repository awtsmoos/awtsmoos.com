//B"H
//Blessed is He
//Boruch Hashem
/**
 * Delete a heichel, split verbatim from heichel.js.
 */
var { NO_LOGIN, sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er } = require("./general.js");
const { compileFullDeletionTasksForSingleSeries } = require("./seriesDelete.js");
const { deleteAllRichCommentsForPost } = require("./comments/richCommentCascade.js");

/**
 * @description Cascades everything a whole-heichel deletion must reach
 * beyond the heichel's own subtree, BEFORE that subtree is deleted:
 * - rich comments of every post in every series (their store is keyed by
 *   heichel + post and lives outside the subtree), cascaded synchronously
 *   through the comments layer's own delete primitive;
 * - other aliases' tracking references (postsSubmitted entries and series
 *   tracking arrays live under /aliases/, outside the subtree), compiled by
 *   the same recursive series compiler the series delete flow uses and
 *   scheduled as one background job; task paths inside the heichel subtree
 *   are dropped from that job because the subtree delete below covers them.
 * Every step is failure-isolated: a cascade problem is logged, never a
 * reason to leave the heichel itself undeleted.
 * @returns {Promise<{posts:number, richDeleted:number, trackingTasks:number}>}
 */
async function cascadeHeichelContents({ $i, aliasId, heichelId }) {
    const summary = { posts: 0, richDeleted: 0, trackingTasks: 0 };
    const postSink = [];
    let tasks = [];
    try {
        tasks = await compileFullDeletionTasksForSingleSeries({
            $i,
            heichelId,
            seriesId: "root",
            parentBreadcrumb: [],
            deleteSelf: false,
            postSink
        });
    } catch (e) {
        console.error(`Heichel cascade: series scan failed for ${heichelId}:`, e);
    }
    summary.posts = postSink.length;

    for (const entry of postSink) {
        try {
            const result = await deleteAllRichCommentsForPost({
                $i, heichelId, postId: entry.postId, reason: "heichel-deleted"
            });
            summary.richDeleted += result.deleted || 0;
        } catch (e) {
            console.error(`Heichel cascade: rich comments failed for post ${entry.postId}:`, e);
        }
    }

    const aliasPrefix = `${sp}/aliases/`;
    const trackingTasks = (tasks || []).filter(t =>
        t && t.params && typeof t.params.path === "string" && t.params.path.startsWith(aliasPrefix)
    );
    summary.trackingTasks = trackingTasks.length;
    if (trackingTasks.length && typeof $i.createJob === "function") {
        try {
            await $i.createJob({
                description: `Alias tracking cleanup for deleted heichel '${heichelId}'.`,
                tasks: trackingTasks,
                requestedBy: aliasId
            });
        } catch (e) {
            console.error(`Heichel cascade: tracking cleanup job failed for ${heichelId}:`, e);
        }
    }
    return summary;
}

async function deleteHeichel({
    $i,
    
    
    aliasId,
    heichelId
}) {
    if (!loggedIn($i)) {
        return er(NO_LOGIN);
    }

    // Authorization is enforced by the route layer before this is reached:
    // the heichel routes resolve through deleteHeichelForAlias, which
    // requires the alias to hold heichel authority (and, for whole-heichel
    // deletion, to be the heichel's creator). This function is the trusted
    // internal primitive behind that gate; direct internal callers are
    // responsible for their own authorization, as the agent transaction
    // route is for its user context.

    try {

        // Cascade everything outside the heichel subtree first, while the
        // series and post records still exist to be enumerated.
        const cascade = await cascadeHeichelContents({ $i, aliasId, heichelId });

        // Delete references in other entities such as aliases, 
        //editors, viewers, etc.
        await $i.db
        .removeElementFromArray(`${
            sp

        }/aliases/${
            aliasId
        }/heichelosCreated/`, {
            exact: {
                selfEquals: heichelId
            }
        });
        await $i.db.delete(sp + `/heichelos/${heichelId}`);

        return {
            message: "Heichel deleted successfully",
            cascade
        };
    } catch (error) {
        console.error("Failed to delete heichel", error);
        return er("Failed to delete heichel");
    }
}
module.exports = { deleteHeichel, cascadeHeichelContents };
