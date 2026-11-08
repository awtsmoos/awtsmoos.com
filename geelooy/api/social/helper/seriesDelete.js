//B"H
//Blessed is He
//Boruch Hashem
/**
 * Recursive deletion-task compiler for one series (relocated verbatim from series.js).
 */
const { sp } = require("./_awtsmoos.constants.js");
const { seriesBasePath, seriesPrateemPath, seriesSubSeriesPath, seriesPostsPath, aliasSeriesTrackingPath } = require("./seriesPaths.js");
const { getParentCommentsBasePath } = require("./comments/commentPaths.js");

/**
 * Scans a single series and compiles a complete and foolproof list of deletion tasks
 * for itself and all its contents (posts, comments, and all alias references).
 * @returns {Promise<Array<object>>} A promise resolving to an array of task objects.
 */
async function compileFullDeletionTasksForSingleSeries({
	$i, 
	heichelId, 
	seriesId, 
	parentBreadcrumb,
	deleteSelf = true,
	postSink = null
}) {
    const tasks = [];
    const db = $i.db;

    // --- Part 1: Get data needed for cleanup ---
    let postsData = {};
    const seriesPrateem = (await db.get(seriesPrateemPath(heichelId, seriesId), { propertyMap: { author: true } }).catch(() => null));
    var postsPath = seriesPostsPath(heichelId, seriesId)
    try {
        postsData = await db.get(postsPath) || {};
    } catch (e) { /* Fails gracefully if posts object doesn't exist */ }
    
    // --- THE FIX: Construct the breadcrumb from the known parent's breadcrumb ---
    const currentBreadcrumb = [...parentBreadcrumb, { id: seriesId, name: seriesPrateem?.name || "[Unnamed/Ghost]" }];
    const crumbPath = currentBreadcrumb.map(c => c.id).join("/");

    // --- Part 2: Generate tasks for all posts within this series ---
    // B"H 2026-11-08 (real-backend verify): db.get(seriesPostsPath)
    // returns DIFFERENT shapes by backend. The legacy/Map store holds an
    // object {postId: {author, ...}}; the real DosDB returns the directory
    // listing, an ARRAY of postIds. The old loop ran Object.entries over
    // the array, got [index, postId-string] pairs, and skipped every post
    // (no .author on a string) — so series delete compiled ZERO per-post
    // tasks: alias tracking, comment hierarchies, and the rich-comment
    // cascade all silently missed every post, and the heichel-level post
    // records were never in the task list at all. Normalize both shapes
    // into {postId, author} pairs first.
    const postPairs = [];
    if (Array.isArray(postsData)) {
        for (const postId of postsData) {
            if (typeof postId !== 'string' || !postId) continue;
            let author = null;
            try {
                const rec = await db.get(`${seriesBasePath(heichelId, seriesId)}/posts/${postId}`);
                if (rec && typeof rec === 'object') author = rec.aliasId || rec.author || null;
            } catch (_) { /* record unreadable: still delete by postId below */ }
            postPairs.push({ postId, author });
        }
    } else if (postsData && typeof postsData === 'object') {
        for (const [postId, postData] of Object.entries(postsData)) {
            if (!postId) continue;
            postPairs.push({ postId, author: (postData && typeof postData === 'object') ? (postData.author || null) : null });
        }
    }
    if (crumbPath) {
        for (const { postId, author } of postPairs) {
            // Optional collection for callers that must also cascade stores
            // the job tasks cannot reach (the rich comment store is keyed by
            // heichel + post and lives outside this database's task paths).
            if (Array.isArray(postSink)) {
                postSink.push({ heichelId, seriesId, postId, author });
            }

            if (author) {
                const postTrackingPath = `${sp}/aliases/${author}/postsSubmitted/inHeichel/${heichelId}/seriesChain/${crumbPath}`;
                tasks.push({
                    operation: 'DELETE_ENTRY',
                    params: {
                        path: postTrackingPath,
                        key: postId
                    }
                });
            }

            // Also add task to delete the comment hierarchy for this post
            tasks.push({
                operation: 'DELETE_PATH',
                params: { path: getParentCommentsBasePath({ heichelId, seriesId, parentId: postId, parentType: "post", postId: postId }) }
            });

            // B"H 2026-11-08: the importer writes each post TWICE — the
            // series-path record and the heichel-level record. The series
            // subtree delete below only removes the series path; without
            // this task the heichel-level copy survives as an orphan.
            tasks.push({
                operation: 'DELETE_PATH',
                params: { path: `${sp}/heichelos/${heichelId}/posts/${postId}` }
            });
        }
    }
    
    // --- Part 3: Generate tasks for the series itself ---
    
    if(deleteSelf) {
	    if (seriesPrateem?.author) {
	        tasks.push({
	            operation: 'REMOVE_FROM_ARRAY',
	            params: { path: aliasSeriesTrackingPath(seriesPrateem.author, heichelId), conditions: { exact: { selfEquals: seriesId } }, options: { deleteSelfIfEmpty: true } }
	        });
	    }
	    tasks.push({ operation: 'DELETE_PATH', params: { path: seriesBasePath(heichelId, seriesId) } });
	    tasks.push({ operation: 'DELETE_PATH', params: { path: `${sp}/heichelos/${heichelId}/comments/atSeries/${seriesId}` } });
    }
    
    tasks.push({
        operation: 'DELETE_PATH',
        params: { path: postsPath  }
    });
    // --- Part 4 (Recursive Call): Compile tasks for all children of this series ---
    try {
        const subSeriesIds = await db.get(seriesSubSeriesPath(heichelId, seriesId));
        if (Array.isArray(subSeriesIds) && subSeriesIds.length > 0) {
            const childTaskPromises = subSeriesIds.map(subId => 
                compileFullDeletionTasksForSingleSeries({ $i, heichelId, seriesId: subId, parentBreadcrumb: currentBreadcrumb, postSink })
            );
            const childTasksNested = await Promise.all(childTaskPromises);
            tasks.push(...childTasksNested.flat());
        }
    } catch(e) { /* Fails gracefully if no subseries exist */ }
    
    return tasks;
}

module.exports = { compileFullDeletionTasksForSingleSeries };
