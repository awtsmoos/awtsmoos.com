/**
 * B"H
 *
 * Helper functions to manage SERIES.
 * Series contain details (prateem), an array of subSeries IDs,
 * and an object containing their posts.
 */

const { sp } = require("./_awtsmoos.constants.js");
const { er, myOpts, generateAwtsmoosId, loggedIn } = require("./general.js");
const { verifyHeichelAuthority } = require("./heichel.js");
const { deletePostFromSeries, getPostsInSeries } = require("./post/index.js"); // For recursive delete
const { deleteAllCommentsOfParent } = require("./comments/index.js"); // For recursive delete
var{
    // New path functions
    getAliasCommentFilePath,
    getParentCommentsBasePath,
    getListOfPostsOrCommentsInSeriesPath,
    getPathAtSeries,
    commentsOfAliasByHeichelAndSeries, // For index cleanup
    // Utility
    getConditionalPathIfPostOrComment
} = require("./comments/commentPaths.js");

// Helper paths
const seriesBasePath = (h, s) => `${sp}/heichelos/${h}/series/${s}`;
const seriesPrateemPath = (h, s) => `${seriesBasePath(h, s)}/prateem`;
const seriesSubSeriesPath = (h, s) => `${seriesBasePath(h, s)}/subSeries`;
const seriesPostsPath = (h, s) => `${seriesBasePath(h, s)}/posts`;
const aliasSeriesTrackingPath = (aliasId, h) => `${sp}/aliases/${aliasId}/seriesCreated/inHeichel/${h}`;


/**
 * @description Ensures the 'root' series structure exists within a Heichel. Creates it if not found.
 * Internal helper function.
 */
async function ensureRootSeriesExists({ $i, heichelId }) {
    const rootPrateemPath = seriesPrateemPath(heichelId, "root");
    try {
        // Check if root prateem already exists
        const rootExists = await $i.db.get(rootPrateemPath, { propertyMap: { id: true } });
        if (rootExists) {
            return { success: true, existed: true }; // Root already exists
        }
    } catch (e) {
        // If error is "Path does not exist", we need to create it.
        // If it's another error, rethrow it.
        if (!e.message?.includes("Path does not exist") && e.code !== 'PATH_NOT_FOUND' /* Adapt based on db error codes */) {
            console.error(`Error checking for root series existence in ${heichelId}:`, e);
            throw new Error(`Failed to check root series existence: ${e.message}`);
        }
        // Path doesn't exist, proceed to create below.
    }

    // Root doesn't exist, create it
    try {
        const rootPrateem = {
            id: "root",
            name: "Root",
            description: "The base series of the Heichel.",
            author: "system", // Or null, or the Heichel creator? 'system' seems reasonable.
            parentSeriesId: null, // Root has no parent
            createdAt: Date.now(),
            isRoot: true
        };
        await $i.db.write(rootPrateemPath, rootPrateem);
        await $i.db.write(seriesSubSeriesPath(heichelId, "root"), []); // Initialize subSeries
        await $i.db.write(seriesPostsPath(heichelId, "root"), {});   // Initialize posts

        return { success: true, created: true };
    } catch (eCreate) {
        console.error(`Failed to create 'root' series structure for Heichel ${heichelId}:`, eCreate);
        throw new Error(`Failed to create root series: ${eCreate.message}`);
    }
}

// 
/**
 * @description Recursively finds all descendant series IDs for a given series.
 * @returns {Promise<Array<string>>} A flat array of all series IDs to be deleted.
 */
async function getAllDescendantIds({ $i, heichelId, seriesId }) {
    const idsToDelete = new Set();
    const seriesProcessed = new Set(); // For cycle detection

    const seriesSubSeriesPath = (h, s) => `${sp}/heichelos/${h}/series/${s}/subSeries`;

    async function recursiveScan(currentSeriesId) {
        if (seriesProcessed.has(currentSeriesId)) return;
        seriesProcessed.add(currentSeriesId);

        idsToDelete.add(currentSeriesId); // Add the current series to the list

        const subSeriesPath = seriesSubSeriesPath(heichelId, currentSeriesId);
        try {
            const subSeriesIds = await $i.db.get(subSeriesPath);
            if (Array.isArray(subSeriesIds)) {
                for (const subId of subSeriesIds) {
                    await recursiveScan(subId); // Recurse into children
                }
            }
        } catch (e) {
            // This is not an error, it just means the series has no children.
            if (!e.message.includes("Path does not exist")) {
                console.error(`Error scanning sub-series for ${currentSeriesId}:`, e);
            }
        }
    }

    await recursiveScan(seriesId);
    return Array.from(idsToDelete);
}

/**
 * @description Creates a new series, initializes its structure, and adds it to its parent.
 * Ensures the parent (including 'root') exists before creation.
 * @requires $_POST: { aliasId, seriesName/title/name, description?, parentSeriesId? (defaults to 'root') }
 */
async function makeNewSeries({ $i, heichelId }) {
    // 1. Basic Checks & Auth
    if (!loggedIn($i)) return er({ message: "NO_LOGIN" });

    const { aliasId, description = "" } = $i.$_POST;
    const seriesName = ($i.$_POST.seriesName || $i.$_POST.title || $i.$_POST.name || "").trim();
    const parentSeriesId = $i.$_POST.parentSeriesId || "root";

    if (!aliasId || !seriesName) {
        return er({ code: "MISSING_PARAMS", details: "Requires aliasId and seriesName/title/name" });
    }
    if (seriesName.length > 100 || description.length > 888) {
        return er({ message: "Input too long", proper: { seriesName: 100, description: 888 } });
    }

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

	var newSeriesBasePath
	var seriesId;
	try {
		// 2. Ensure Parent/Root Exists *Before* Creating New Series
        if (parentSeriesId === "root") {
            const rootResult = await ensureRootSeriesExists({ $i, heichelId });
            if (!rootResult.success) {
                // Error is already logged in ensureRootSeriesExists
                return er({ code: "ROOT_ENSURE_FAILED", details: "Could not verify or create root series." });
            }
        } else {
            // Check non-root parent existence
            try {
                const parentExists = await $i.db.get(seriesPrateemPath(heichelId, parentSeriesId), { propertyMap: { id: true } });
                if (!parentExists) {
                    return er({ code: "PARENT_SERIES_NOT_FOUND", details: { heichelId, parentSeriesId } });
                }
            } catch (e) {
                // Handle DB error during check
                 if (e.message?.includes("Path does not exist") || e.code === 'PATH_NOT_FOUND') {
                      return er({ code: "PARENT_SERIES_NOT_FOUND", details: { heichelId, parentSeriesId } });
                 }
                 console.error(`Error checking parent series ${parentSeriesId}: ${e.message}`);
                 return er({ code: "PARENT_CHECK_FAILED", details: e.message });
             }
        }
		
	    // 3. Generate New Series ID
		var inputId = $i.$_POST.inputId;
		if(!inputId || inputId == "undefined") {
			inputId = $i.utils.generateId(seriesName, false, 0);
	
			
		}
		inputId = inputId.trim()
		if(!inputId) {
			inputId = `BH_${aliasId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
		}
		//inputId = $i.utils.generateId(inputId, false, 0)
		var parentSubSeriesIDs = await $i.db.get(
			seriesSubSeriesPath(heichelId, parentSeriesId)
		);
		if(!parentSubSeriesIDs) {
			parentSubSeriesIDs = [];
		}

		if(!Array.isArray(parentSubSeriesIDs)) {
			return er({
				message: "Issue with array",
				parentSubSeriesIDs
			})
		}
		var k = inputId;
		var times = 0;
		while(parentSubSeriesIDs.includes(k)) {
			times++
			k = inputId + "_" + times;
			
		}
		seriesId = inputId;
		newSeriesBasePath = seriesBasePath(heichelId, seriesId); // For potential rollback

	} catch(e) {
		return er({
			code: "WHAT",
			stack: e.stack
		})
	}
    try {
        

		
        // 4. Create the new series structure (Parent/Root confirmed)
        const prateemData = {
            id: seriesId,
            name: seriesName,
            description,
            author: aliasId,
            parentSeriesId: parentSeriesId,
            createdAt: Date.now()
        };
        
        var seriesPrateemToWriteTo = seriesPrateemPath(heichelId, seriesId)
        await $i.db.write(seriesPrateemToWriteTo , prateemData);
      
      
        
        await $i.db.write(seriesSubSeriesPath(heichelId, seriesId), []);
        await $i.db.write(seriesPostsPath(heichelId, seriesId), {});

        // 5. Add this new series' ID to the parent's subSeries array
        // No need to check parent again, addSubSeriesToParent will handle array logic
        const addedToParent = await addSubSeriesToParent({
            $i, heichelId, parentSeriesId, childSeriesId: seriesId
        });

        if (addedToParent?.error) {
            // Attempt rollback: Delete the newly created series structure
            console.error(`Failed to add ${seriesId} to parent ${parentSeriesId}. Rolling back...`);
            await $i.db.delete(newSeriesBasePath).catch(err => console.error(`Rollback failed for ${seriesId}:`, err));
            throw new Error(`Failed to add to parent series: ${addedToParent.error.message || addedToParent.error}`);
        }

        // 6. Track series creation for the alias
        const trackingPath = aliasSeriesTrackingPath(aliasId, heichelId);
        const trackResult = await $i.db.syncKeyInObj(trackingPath, seriesId);
        if (trackResult?.error) {
            console.error(`Failed to track series ${seriesId} creation for alias ${aliasId}: ${trackResult.error}`);
            // Non-critical error, proceed but log it
        }

        // 7. Return Success
        return { success: {
			id: seriesId, 
			newSeriesID: seriesId,
			name: seriesName, 
			parentId: parentSeriesId 
		} };

    } catch (e) {
        // Catch errors from steps 4, 5, or rethrown errors from 3
        console.error("Error during makeNewSeries process:", e);
        // Attempt cleanup if error happened after step 4 started
        if (!e.code || (e.code !== 'PARENT_SERIES_NOT_FOUND' && e.code !== 'ROOT_ENSURE_FAILED')) {
             await $i.db.delete(newSeriesBasePath).catch(err => console.error("Cleanup failed after error:", err));
         }
        return er({ code: "SERIES_CREATE_FAILED", details: e.message, stack: e.stack });
    }
}


/**
 * @description Helper to add a child series ID to a parent's subSeries array.
 * Internal use by makeNewSeries and potentially move operations.
 * Assumes parent series structure exists (checked by caller like makeNewSeries).
 */
async function addSubSeriesToParent({ $i, heichelId, parentSeriesId, childSeriesId }) {
    const parentSubSeriesPath = seriesSubSeriesPath(heichelId, parentSeriesId);
    try {
        let subSeries;
        try {
            subSeries = await $i.db.get(parentSubSeriesPath);
        } catch (eGet) {
            // If parent path *still* doesn't exist here, something is wrong upstream
            // or it's a race condition. Try initializing.
             if (eGet.message?.includes("Path does not exist") || eGet.code === 'PATH_NOT_FOUND') {
                 console.warn(`Parent series ${parentSeriesId} subSeries path not found in addSubSeriesToParent. Initializing. Caller should have ensured existence.`);
                 subSeries = [];
             } else {
                 throw eGet; // Rethrow other DB errors
             }
         }

        if (!Array.isArray(subSeries)) {
            // Path existed but wasn't an array? Problematic. Log and overwrite.
            console.error(`Data Corruption: Parent series ${parentSeriesId} subSeries path was not an array. Overwriting.`);
            subSeries = [];
        }

        subSeries = appendAndDeduplicateString(subSeries,childSeriesId) 
     
        const writeResult = await $i.db.write(parentSubSeriesPath, subSeries);
        if (writeResult?.error) {
             throw new Error(`DB write error: ${writeResult.error.message || writeResult.error}`);
         }
        
        return { success: true };
    } catch (e) {
        console.error(`Failed to add ${childSeriesId} to parent ${parentSeriesId}:`, e);
        return er({ code: "ADD_TO_PARENT_FAILED", details: e.message });
    }
}
/**
 * Appends a string to an array and removes all duplicate instances of that string,
 * ensuring only one instance remains (the one that was just added, or the first one found).
 *
 * @param {Array<string>} arr - The array to modify.
 * @param {string} newString - The string to append and de-duplicate.
 * @returns {Array<string>} The modified array with only one instance of newString.
 */
function appendAndDeduplicateString(arr, newString) {
    // 1. Append the new string to the array
    arr.push(newString);

    // 2. Use a Set to filter out duplicates while preserving insertion order (for modern JS environments)
    // Note: This removes *all* duplicates of newString, not just the new one.
    const uniqueElements = new Set(arr);

    // 3. Convert the Set back to an Array
    const newArr = Array.from(uniqueElements);

    // Optional: If you specifically want the *new* one to be the *last* element,
    // you'd need a slightly more complex filter:
    /*
    const filteredArr = [];
    let foundNewString = false;
    for (const item of arr) {
        if (item === newString) {
            if (!foundNewString) {
                filteredArr.push(item);
                foundNewString = true;
            }
        } else {
            filteredArr.push(item);
        }
    }
    return filteredArr;
    */

    return newArr;
}
/**
 * @description Edits the details (prateem) of an existing series.
 * @requires $_PUT: { aliasId, description?, seriesName/name/title? }
 */
async function editSeriesDetails({ $i, heichelId, seriesId }) {
    if (!loggedIn($i)) return er({ message: "NO_LOGIN" });

    const { aliasId } = $i.$_PUT;
    const newDescription = $i.$_PUT.description;
    const newName = $i.$_PUT.seriesName || $i.$_PUT.name || $i.$_PUT.title;
    // Note: Changing parentSeriesId should be handled by a dedicated "move" function.

    if (!aliasId) return er({ code: "MISSING_PARAMS", details: "Requires aliasId" });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    const prateemPath = seriesPrateemPath(heichelId, seriesId);

    try {
        // Fetch existing prateem to update
        const currentPrateem = await $i.db.get(prateemPath);
        if (!currentPrateem) {
            return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId } });
        }

        const updatedPrateem = { ...currentPrateem };
        let changed = false;

        if (newName && typeof newName === "string" && newName.trim().length > 0 && newName.length <= 100) {
            updatedPrateem.name = newName.trim();
            changed = true;
        }
        if (newDescription !== undefined && typeof newDescription === "string" && newDescription.length <= 888) {
             // Allow setting empty description
             updatedPrateem.description = newDescription;
             changed = true;
         }

        if (changed) {
            updatedPrateem.updatedAt = Date.now();
            const writeResult = await $i.db.write(prateemPath, updatedPrateem);
            if (writeResult?.error) {
                throw new Error(`DB write error: ${writeResult.error.message || writeResult.error}`);
            }
        }

        return { success: { message: changed ? "Series updated" : "No changes applied", seriesId } };

    } catch (e) {
        console.error("Error in editSeriesDetails:", e);
        // Check for specific DB errors like not found
        if (e.message.includes("Path does not exist")) {
             return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId } });
        }
        return er({ code: "SERIES_EDIT_FAILED", details: e.message });
    }
}


/**
 * @description Retrieves series data.
 * @param withDetails If true, includes subSeries IDs and posts (full data).
 * @param properties Optional propertyMap for prateem (ignored if withDetails is false?).
 */
async function getSeries({ 
	$i, heichelId, seriesId, 
	withDetails = false, properties,
	withSubSeriesDetails=false,
	only=null//"posts", "subSeries"
}) {
    // Add view permission checks if needed
    const opts = myOpts($i); // For propertyMap
    const baseP = seriesBasePath(heichelId, seriesId);
    const prateemP = seriesPrateemPath(heichelId, seriesId);
    const subSeriesP = seriesSubSeriesPath(heichelId, seriesId);
    const postsP = seriesPostsPath(heichelId, seriesId);

    try {
        let prateem;
        if (seriesId === "root") {
             // Synthesize root prateem
             prateem = { id: "root", name: "Root", description: "The starting point", isRoot: true };
         } else {
             prateem = await $i.db.get(prateemP, properties ? { propertyMap: properties } : opts);
             if (!prateem) {
                 return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId } });
             }
             // Ensure ID is present
             if (!prateem.id) prateem.id = seriesId;
         }

        const result = { prateem };
		if(withSubSeriesDetails) {
			const subSeriesIds = await $i.db.get(subSeriesP);
		}
        if (withDetails) {
            // Get subSeries IDs (always an array, empty if none)
	        if(!only || only == "subSeries") {
			try {
				
                const subSeriesIds = await $i.db.get(subSeriesP);
				var subSeriesPrateems = [];
				if(Array.isArray(subSeriesIds)) {
					/*for(var subSeriesId of subSeriesIds) {
						var subSeriesPath = seriesPrateemPath(heichelId, subSeriesId);
						var red = await $i.db.get(subSeriesPath);
						subSeriesPrateems.push(red);
					}*/
					result.subSeries = subSeriesIds//subSeriesPrateems;
				} else result.subSeries = [];
            } catch (e) {
                 if (e.message.includes("Path does not exist")) result.subSeries = [];
                 else throw e; // Rethrow other errors
             }
			}

			if(!only || only == "posts") {
             // Get posts (always an object, empty if none)
             try {
                // Get the full post objects directly
                 const postsData = await $i.db.getObjectKeys(postsP);
                 result.posts = (postsData && typeof postsData === 'object') ? postsData : {};
             } catch (e) {
                 if (e.message.includes("Path does not exist")) result.posts = {};
                 else throw e; // Rethrow other errors
             }
			}
        }

        result.id = seriesId;
        return result;

    } catch (e) {
        console.error(`Error getting series ${seriesId}:`, e);
        if (e.message.includes("Path does not exist") || e.code === "SERIES_NOT_FOUND") {
            return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId }, error: e.stack });
        }
        return er({ code: "SERIES_GET_FAILED", details: e.message });
    }
}

/**
 * @description Gets the IDs of sub-series within a parent series.
 * @param withDetails If true, fetches full prateem for each sub-series.
 */
async function getSubSeries({ $i, heichelId, parentSeriesId, withDetails = true }) {
    const subSeriesP = seriesSubSeriesPath(heichelId, parentSeriesId);

    try {
        let subSeriesIds = await $i.db.get(subSeriesP);
        if (!Array.isArray(subSeriesIds)) {
            return []; // Return empty array if no subseries or path invalid
        }

		

        if (!withDetails) {
            return subSeriesIds;
        } else {
            // Fetch details for each sub-series ID
            const detailedSeries = [];
            for (const seriesId of subSeriesIds) {
	        var serPath = seriesPrateemPath(heichelId, seriesId)
                const seriesData = await $i.db.get(serPath)
                
                if (seriesData && !seriesData.error && !Buffer.isBuffer(seriesData)) {
                    detailedSeries.push(seriesData);
                } else {
                  //  console.warn(`Could not fetch details for sub-series ${seriesId} in ${parentSeriesId}`);
                    // Optionally include a placeholder or skip
                   detailedSeries.push({ id: seriesId, error: "Details not found" });
                }
            }
            return detailedSeries;
        }

    } catch (e) {
        if (e.message.includes("Path does not exist")) {
            return []; // Parent series might not exist or have subSeries
        }
        console.error(`Error getting subSeries for ${parentSeriesId}:`, e);
        return er({ code: "SUB_SERIES_GET_FAILED", details: e.message });
    }
}




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
// 


async function deleteSeriesFromHeichel({$i, 
	heichelId, 
	seriesId, 
	parentSeriesId, 
	userid,
	deleteSelf = true
}) {
    const aliasId = $i.$_POST.aliasId;
    if (!aliasId || !parentSeriesId || seriesId === "root") return er({ message: "Invalid parameters for deletion." });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    try {
      
        // Step 1: Create the top-level UNLINK task.
        const unlinkTask = {
            operation: 'REMOVE_FROM_ARRAY',
            params: {
                path: seriesSubSeriesPath(heichelId, parentSeriesId),
                conditions: { exact: { selfEquals: seriesId } }
            }
        };

        // Step 2: Get the parent's breadcrumb. We need this for the recursive compiler.
        const parentBreadcrumb = await $i.fetchAwtsmoos(`/api/social/heichelos/${heichelId}/series/${parentSeriesId}/breadcrumb`);
        if (!Array.isArray(parentBreadcrumb)) {
            throw new Error(`Could not fetch breadcrumb for known parent '${parentSeriesId}'.`);
        }

        // Step 3: Recursively compile all cleanup tasks for the series and its descendants.
        var contentCleanupTasks = await compileFullDeletionTasksForSingleSeries({
            $i,
            heichelId,
            seriesId,
            deleteSelf,
            parentBreadcrumb // Provide the starting context
        });
        
        if(deleteSelf) {
	        contentCleanupTasks  = [unlinkTask, ...contentCleanupTasks]
        }

        // Step 4: Create and queue the job.
        const { jobId } = await $i.createJob({
            description: `Fully ${deleteSelf ? 
	            "delete" : "empty"} series '${seriesId}' from parent '${parentSeriesId}'.`,
            tasks: contentCleanupTasks ,
            requestedBy: aliasId
        });
        
        return { 
            success: { 
                message: "Series deletion has been queued. All content and references will be removed shortly.",
                jobId: jobId ,
                deleteSelf
            } 
        };
    } catch (e) {
        return er({ code: "SERIES_DELETE_JOB_CREATION_FAILED", details: e.message, stack: e.stack });
    }
}


/**
 * @description Moves one or more sub-series from one parent series to another.
 * @requires $_POST: { aliasId, subSeriesIDs (array), seriesToId (new parent) }
 */
async function changeSubSeriesFromOneSeriesToAnother({ $i, heichelId, seriesFromId, seriesToId }) {
    const { aliasId, subSeriesIDs } = $i.$_POST;

    if (!aliasId || !Array.isArray(subSeriesIDs) || !seriesToId || !seriesFromId) {
        return er({ code: "MISSING_PARAMS", details: "Requires aliasId, subSeriesIDs (array), seriesFromId, seriesToId" });
    }
    if (seriesFromId === seriesToId) return er({ code: "CANNOT_MOVE_TO_SELF" });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    // Check if target series exists (optional but good)
    // ... (add check similar to makeNewSeries parent check)

    const sourcePath = seriesSubSeriesPath(heichelId, seriesFromId);
    const targetPath = seriesSubSeriesPath(heichelId, seriesToId);
    const results = { moved: [], errors: [] };

    try {
        // 1. Remove from source series' subSeries array
        let sourceSubSeries = await $i.db.get(sourcePath);
        if (!Array.isArray(sourceSubSeries)) sourceSubSeries = [];

        const remainingSource = sourceSubSeries.filter(id => !subSeriesIDs.includes(id));
        const actuallyMoved = sourceSubSeries.filter(id => subSeriesIDs.includes(id)); // IDs that were actually in source

        if (actuallyMoved.length > 0) {
            const writeSource = await $i.db.write(sourcePath, remainingSource);
            if (writeSource?.error) throw new Error(`Failed to update source series ${seriesFromId}: ${writeSource.error}`);
        } else {
             console.warn("None of the specified subSeriesIDs were found in the source series.");
             // Proceed to add them to target anyway? Or return error? Let's proceed.
        }


        // 2. Add to target series' subSeries array
        let targetSubSeries = await $i.db.get(targetPath);
        if (!Array.isArray(targetSubSeries)) targetSubSeries = [];

        const toAdd = subSeriesIDs.filter(id => !targetSubSeries.includes(id)); // Add only if not already present
        if (toAdd.length > 0) {
            const newTargetSubSeries = [...targetSubSeries, ...toAdd];
            const writeTarget = await $i.db.write(targetPath, newTargetSubSeries);
            if (writeTarget?.error) throw new Error(`Failed to update target series ${seriesToId}: ${writeTarget.error}`);
        }


        // 3. Update parentSeriesId in the moved series' prateem
        for (const movedId of subSeriesIDs) { // Iterate over requested IDs, not just actuallyMoved
             const movedPrateemPath = seriesPrateemPath(heichelId, movedId);
             try {
                 const prateem = await $i.db.get(movedPrateemPath);
                 if (prateem) {
                     prateem.parentSeriesId = seriesToId;
                     prateem.updatedAt = Date.now();
                     const updatePrateem = await $i.db.write(movedPrateemPath, prateem);
                     if (updatePrateem?.error) {
                          results.errors.push(`Failed to update parentId for ${movedId}: ${updatePrateem.error}`);
                      } else {
                          results.moved.push(movedId);
                      }
                 } else {
                      results.errors.push(`Prateem not found for ${movedId}, cannot update parentId.`);
                  }
             } catch (ePrat) {
                  results.errors.push(`Error updating parentId for ${movedId}: ${ePrat.message}`);
              }
         }

        if (results.errors.length > 0) {
             return er({ code: "SERIES_MOVE_INCOMPLETE", moved: results.moved, errors: results.errors });
         }

        return { success: { message: "Sub-series moved", moved: results.moved, from: seriesFromId, to: seriesToId } };

    } catch (e) {
        console.error("Error moving sub-series:", e);
        return er({ code: "SERIES_MOVE_FAILED", details: e.message, moved: results.moved, errors: results.errors });
    }
}

/**
 * @description Replaces the entire list of sub-series for a given series.
 * Useful for reordering or bulk setting.
 * @requires $_POST: { aliasId, subSeriesIDs (array, the new complete list) }
 */
async function editSubSeriesInSeries({ $i, heichelId, seriesId }) {
    const { aliasId, subSeriesIDs } = $i.$_POST;

    if (!aliasId || !Array.isArray(subSeriesIDs)) {
        return er({ code: "MISSING_PARAMS", details: "Requires aliasId and subSeriesIDs (array)" });
    }

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    const subSeriesP = seriesSubSeriesPath(heichelId, seriesId);
    const results = { updated: [], errors: [] };

    try {
        // 1. Write the new array of subSeries IDs
        // Basic validation: check if IDs look reasonable? (optional)
        const writeResult = await $i.db.write(subSeriesP, subSeriesIDs);
        if (writeResult?.error) {
            throw new Error(`DB write error: ${writeResult.error.message || writeResult.error}`);
        }

        // 2. Update parentSeriesId in all specified sub-series
        // This ensures consistency, even if some were already children.
        for (const subId of subSeriesIDs) {
            const subPrateemPath = seriesPrateemPath(heichelId, subId);
            try {
                const prateem = await $i.db.get(subPrateemPath);
                if (prateem && prateem.parentSeriesId !== seriesId) { // Only update if parent differs
                     prateem.parentSeriesId = seriesId;
                     prateem.updatedAt = Date.now();
                     const updatePrateem = await $i.db.write(subPrateemPath, prateem);
                     if (updatePrateem?.error) {
                         results.errors.push(`Failed to update parentId for ${subId}: ${updatePrateem.error}`);
                     } else {
                         results.updated.push(subId);
                     }
                 } else if (!prateem) {
                      results.errors.push(`Prateem not found for ${subId}, cannot update parentId.`);
                  } else {
                      // Parent ID already correct, no update needed
                      results.updated.push(subId); // Count as successfully processed
                  }
            } catch (ePrat) {
                 results.errors.push(`Error updating parentId for ${subId}: ${ePrat.message}`);
             }
        }

        if (results.errors.length > 0) {
             return er({ code: "SUB_SERIES_EDIT_INCOMPLETE", updatedList: subSeriesIDs, errors: results.errors });
         }

        return { success: { message: "Sub-series list updated", seriesId, newList: subSeriesIDs } };

    } catch (e) {
        console.error("Error editing sub-series list:", e);
        return er({ code: "SUB_SERIES_EDIT_FAILED", details: e.message });
    }
}


// --- Functions to keep or adapt from original, if still needed ---

/**
 * @description Gets all series IDs in a Heichel. Relies on DB structure.
 * May need optimization (e.g., dedicated index) for large Heichels.
 * (Keeping original logic for now, assuming `$i.db.get` on the base path works)
 */
async function getAllSeriesInHeichel({ $i, heichelId, withDetails = false }) {
	try {
		var ids = await $i.db.get(sp + `/heichelos/${heichelId}/series/`); // Assumes this lists all series IDs
		if (!ids || !Array.isArray(ids)) { // Adapt based on actual return type
		     console.warn(`getAllSeriesInHeichel: Could not list series IDs for ${heichelId}. Assuming empty.`);
		     ids = [];
		     // Alternatively, implement traversal from root if listing isn't supported.
		 }


		if (!withDetails) return ids;

        // Fetch details concurrently
        const detailsPromises = ids.map(id =>
            getSeries({ $i, heichelId, seriesId: id, withDetails: false }) // Get prateem only
            .then(result => result && !result.error ? result.prateem : {id, error: "Not found or error"})
        );
        const results = await Promise.all(detailsPromises);
        return results.filter(Boolean); // Filter out potential nulls/errors if needed

	} catch (e) {
        console.error(`Error in getAllSeriesInHeichel for ${heichelId}: ${e}`);
		return []; // Return empty on error
	}
}


/**
 * @description Filters sub-series based on a property in their prateem.
 * (Logic largely unchanged, operates on array fetched by getSubSeries)
 */
async function getSeriesByProperty({ $i, heichelId, parentSeriesId, propertyKey, propertyValue }) {
	if (!propertyKey && propertyKey !== 0) {
		return er({ message: "Property key needed", code: "PROP_KEY_NEEDED" });
	}

	try {
		// Get IDs first
		const subSeriesIds = await getSubSeries({ $i, heichelId, parentSeriesId, withDetails: false });
		if (subSeriesIds?.error || subSeriesIds.length === 0) {
			return [];
		}

		const filteredIds = [];
		for (const seriesId of subSeriesIds) {
			try {
			    const prateem = await $i.db.get(seriesPrateemPath(heichelId, seriesId), {
				    propertyMap: { [propertyKey]: true } // Fetch only the needed property
			    });
			    if (prateem && prateem[propertyKey] == propertyValue) {
				    filteredIds.push(seriesId);
			    }
            } catch (eGet) {
                // Ignore series if prateem fetch fails
                console.warn(`Could not check property for sub-series ${seriesId}: ${eGet.message}`);
            }
		}
		return filteredIds;

	} catch (e) {
		console.error("Error in getSeriesByProperty:", e);
		return er({ message: "Failed to filter series by property", code: "SERIES_FILTER_FAILED", details: e.message });
	}
}


// --- Deprecated / Removed Functions ---
// - addContentToSeries: Replaced by addPostToSeries (for posts) and addSubSeriesToParent (internal for series)
// - deleteContentFromSeries: Replaced by deletePostFromSeries and handling within deleteSeriesFromHeichel
// - editPostsInSeries: Ordering via object keys is not reliable/intended. Removed for simplicity.
// - traverseSeries: Complex. If needed, should be rewritten carefully based on new structure. Replace with targeted gets where possible.
// - checkParentIDsAndAdd: Likely related to traversal/old structure. Needs reassessment if specific functionality is required. Replace with targeted updates.


// --- Export the module ---
module.exports = {
    makeNewSeries,
    editSeriesDetails,
    getSeries,
    getSubSeries,
    deleteSeriesFromHeichel,
    changeSubSeriesFromOneSeriesToAnother,
    editSubSeriesInSeries,
    getAllSeriesInHeichel,
    getSeriesByProperty,
    // Removed old functions...

    // --- Removed ---
	// addContentToSeries,
    // deleteContentFromSeries,
	// editPostsInSeries,
	// traverseSeries, // Consider replacing with targeted gets or simpler traversal if needed
	// checkParentIDsAndAdd, // Consider replacing with targeted updates

    // --- Post functions are now in post/index.js ---
};
