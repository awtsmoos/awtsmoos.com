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
	deleteSelf = true
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
    if (postsData && typeof postsData === 'object' && crumbPath) {
        for (const [postId, postData] of Object.entries(postsData)) {
            if (!postData || !postData.author) continue;

            const postTrackingPath = `${sp}/aliases/${postData.author}/postsSubmitted/inHeichel/${heichelId}/seriesChain/${crumbPath}`;
            tasks.push({
                operation: 'DELETE_ENTRY',
                params: { 
                    path: postTrackingPath,
                    key: postId
                }
            });

            // Also add task to delete the comment hierarchy for this post
            tasks.push({
                operation: 'DELETE_PATH',
                params: { path: getParentCommentsBasePath({ heichelId, seriesId, parentId: postId, parentType: "post", postId: postId }) }
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
                compileFullDeletionTasksForSingleSeries({ $i, heichelId, seriesId: subId, parentBreadcrumb: currentBreadcrumb })
            );
            const childTasksNested = await Promise.all(childTaskPromises);
            tasks.push(...childTasksNested.flat());
        }
    } catch(e) { /* Fails gracefully if no subseries exist */ }
    
    return tasks;
}

module.exports = { compileFullDeletionTasksForSingleSeries };
