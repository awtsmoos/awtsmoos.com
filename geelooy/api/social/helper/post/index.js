/**
 * B"H
 *
 * Helper functions to manage POSTS within their SERIES.
 * Posts are stored directly within the series data structure:
 * /<sp>/heichelos/<heichelId>/series/<seriesId>/posts/<postId> -> {postData}
 */

const { sp } = require("../_awtsmoos.constants.js");
const { loggedIn, er, myOpts, generateAwtsmoosId } = require("../general.js");
const { verifyHeichelAuthority } = require("../heichel.js");
const { deleteAllCommentsOfParent } = require("../comments/index.js");
const {
    shouldSubmitPostForApproval,
    submitPostForApproval,
    getSubmittedPosts,
    approveSubmittedPost,
    denySubmittedPost
} = require("./submissions.js");
async function get(pth, $i, withOpts=true) {
	var opts = {};
	opts.max = true;
	try {
		return {
			success: await $i.db.get(
				pth, 
				{
					max: true
				}
				//withOpts ? opts : undefined
 			)
		}
	} catch(e) {
		return er({
			stack: e.stack
		})
	}
}

async function getPostsOfCommentsInSeriesOfAlias({
	$i,
	aliasId,
	heichelId,
	//seriesId,
	crumbpath
}) {
	
	
	var pth = `${sp}/aliases/${
		aliasId	
	}/commets/heichel/${
		heichelId	
	}/series/${
		seriesId
	}/atPost`
	return await get(pth, $i)	
}
async function getSeriesInHeichelOfCommetsOfAlias({
	$i,
	aliasId,
	heichelId
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/commets/heichel/${
		heichelId	
	}/series/`
	return await get(pth, $i)	
}
async function getHeichelosOfCommetsOfAlias({
	$i,
	aliasId
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/commets/heichel`
	return await get(pth, $i)	
}

async function getHeichelosOfSeriesCreatedOfAlias({$i, aliasId}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/seriesCreated/inHeichel`
	return await get(pth, $i)
}


async function getSeriesCreatedOfAliasInHeichel({
	$i, 
	aliasId,
	heichelId
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/seriesCreated/inHeichel/${
		heichelId
	}`
	return await get(pth, $i)
}

async function getHeichelosOfPostsOfAlias({
	$i, aliasId,
	withDetails = true
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/postsSubmitted/inHeichel`
	var g = await get(pth, $i);
	if(g.error) return g;
	if(g.success) g = g.success
	if(!withDetails)
		return g;
	if(!Array.isArray(g)) g = [];
	
	var heichelos = [];
	var hei;
	for(
		hei of g
	) {
		var det = await $i.db.get(
			`${sp}/heichelos/${
				hei
			}/info`, {
				propertyMap: {
					author: true,
					name: true
				}
			}
		);
		if(det) {
			det.id = hei;
			heichelos.push(det)
		}
	}

	return {success: heichelos};
}

async function mapSeriesIDsToSeries({
	$i,
	seriesIDs,
	heichelId
}) {
	if(!Array.isArray(seriesIDs)) {
		seriesIDs = [];
	}
	var res = []
	var ser;
	for(ser of seriesIDs) {
		var det = await $i.db.get(
			`${sp}/heichelos/${
				heichelId
			}/series/${
				ser
			}/prateem`, {
				propertyMap: {
					author: true,
					name: true,
					id: true,
					createdAt: true,
					parentSeriesId: true
				}
			}
		);
		if(det)
			res.push(det)
	}
	return {success: res};
}
async function getSeriesOfPostsOfAliasInHeichel({
	$i, aliasId,
	heichelId,
	withDetails= true
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/postsSubmitted/inHeichel/${
		heichelId
	}/inSeries`
	var g = await get(pth, $i);
	if(!withDetails) return g;
	if(g.success) g = g.success;
	if(g.error) return g;
	return await mapSeriesIDsToSeries({
		$i,
		seriesIDs: g,
		heichelId
	})
	
}

/*return er({
			message: "Missing path to series",
			code: "NO_SERIES_PATH"
		});*/
async function getPostsOfAliasInSeries({
	$i, aliasId,
	heichelId,
	seriesId,
	crumbpath,
	withDetails= false
}) {
	
	var mp = `${sp}/aliases/${
			aliasId	
		}/postsSubmitted/inHeichel/${
			heichelId	
		}/seriesChain/`;
	if(
		typeof(crumbpath) != "string" ||
		crumbpath.length == 0
	) {
		var g = await get(mp, $i)
		return g;
	}
	var crumbled = mp + crumbpath;
	
	var splat = crumbpath.split("/")
	var seriesId = splat[
		splat.length-1
	];

	/*
	return {
		seriesId
	// }*
	/*var pth = `${sp}/aliases/${
		aliasId	
	}/postsSubmitted/inHeichel/${
		heichelId
	}/inSeries/${
		seriesId
	}`*/
	var p = await get(crumbled, $i, false);
	if(p.error) {
		return er(p.error)
	}
	if(p.success) {
		p = p.success
	}
	
	//if(!withDetails) return k
	
	try {
		var postsPath = `${
				sp
			 }/heichelos/${
				heichelId
			 }/series/${
				seriesId
			 }/posts`;

		var allPostIDs = await $i.db.getObjectKeys(
			postsPath
		);
		if(!allPostIDs.length) {
			var ser = await mapSeriesIDsToSeries({
						$i,
						seriesIDs: p,
						heichelId
					});
			if(ser.error) {
				return ser;
			}
			if(Array.isArray(ser.success)) {
				ser = ser.success;
			} else {
				return er({
					message: "Something went wrong. "
					+"Series not in right format",
					details: ser,
					code: "WRONG_FORMAT"
				})
			}
			return {
				seriesInPath: ser
					
			}
		}
		var mapObj = {};
		for(var p of allPostIDs) {
			mapObj[p] = {
				title: true,
				author: {
					equals: aliasId
				},
				createdAt: true,
				id: true,
				parentSeriesId: true
				
			}
		}
		var allPosts = await $i.db.get(
			postsPath
			,
			{
				propertyMap: mapObj
			}
			
		);

		
		
		var ind = 0;
		var postArray = [];
		var k;
		var keys = Object.keys(allPosts)
		for(k of keys) {
			var po = allPosts[k];
			po.index = ind;
			postArray.push(po);
			ind++;
		}
		var vals = Object.values(allPosts)
		return {posts: vals};

		var postsNeedingDeletion = [];
		var legitPosts = {};
		var post;
		var i = 0;
		for(
			post of k
		) {
			var realPost = allPosts.find(q=>
				q == post 	
			)
			if(!realPost) {
				postsNeedingDeletion.push(post)
				
				i++;
				continue;
			}

			var details = await $i.db.get(
				postsPath, 
				{
					propertyMap: {
						[post]: {
							title: true,
							author: true,
							createdAt: true,
							id: true,
							parentSeriesId: true
						}
					}
				}
			)
/*
			if(details.author != aliasId) {
				postsNeedingDeletion.push(post)
				i++;
				continue;
			}
*/
			legitPosts[post] = details?.[post];
			
			i++;
		}
		var res = {};
		if(postsNeedingDeletion.length) {
			res.postsNeedingDeletion = 
				postsNeedingDeletion
		}
		res.posts = legitPosts;
		return res;
	} catch(e) {
		return er({
			stack: e.stack
		})
	}
}
/**
 * @description Adds a new post directly into its parent series' post object.
 * @requires $_POST: { aliasId, title, content, seriesId (parent), dayuh? }
 */
async function addPostToSeries({ $i, heichelId, seriesId, isApproval = false }) {
    if (!loggedIn($i)) return er({ message: "NO_LOGIN" });

    const { aliasId, title, content, dayuh } = 
	$i.$_POST;

	if(!seriesId) {
		seriesId = $i.$_POST.seriesId;
	}
	if(!seriesId) {
		seriesId = "root"
	}
    if (!aliasId || !title) {
        return er({ code: "MISSING_PARAMS", details: "Requires aliasId, title, seriesId" });
    }

    if (title.length > 100 || content.length > 15784) {
        return er({ message: "Input too long", proper: { title: 100, content: 15784 } });
    }

    if (!isApproval) {
        const approvalState = await shouldSubmitPostForApproval({ $i, heichelId, aliasId });
        if (approvalState.error) return approvalState.error;
        if (approvalState.shouldSubmit) {
            return await submitPostForApproval({ $i, heichelId, seriesId });
        }
        if (!approvalState.authority) {
            return er({ code: "NO_AUTH", details: `Alias ${aliasId} cannot post to heichel ${heichelId}` });
        }
    }

    // Check if parent series exists (optional but good practice)
    try {
        const parentExists = await $i.db.get(sp + `/heichelos/${heichelId}/series/${seriesId}/prateem`, { propertyMap: { id: true } });
        if (!parentExists && seriesId !== "root") {
           // If we want strict checking, uncomment below
           return er({ code: "PARENT_SERIES_NOT_FOUND", details: { heichelId, seriesId } });
           // For now, let's assume it might be created implicitly or checked elsewhere.
           // A robust system might require explicit series creation first.
           console.warn(`Parent series ${seriesId} not explicitly found, proceeding anyway.`);
        }
    } catch (e) {
        // Handle case where path doesn't exist - maybe okay if it's root or implicitly created
         if (seriesId !== "root") {
            console.warn(`Error checking parent series ${seriesId}: ${e.message}`);
         }
    }


    const postId = `BH_POST_${Date.now()}_${aliasId}_${Math.floor(Math.random() * 1000)}`;
    const postData = {
        id: postId,
        title: title.trim(),
        content: content.trim(),
        author: aliasId,
        parentSeriesId: seriesId, // Good to keep for context, though implicit in path
        createdAt: Date.now(),
        ...(dayuh && { dayuh }) // Include dayuh if provided
    };

    const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;

    try {
    
	    //start by adding tracker
        

	var bready = await $i.fetchAwtsmoos(`/api/social/heichelos/${
			heichelId
		}/series/${
			seriesId
		}/breadcrumb`);
		
	if(Array.isArray(bready)) {
		var crumbed = bready.map(q=>q.id)
			.join("/");
		const trackingPath = `${
			sp
		}/aliases/${
			aliasId
		}/postsSubmitted/inHeichel/${
			heichelId
		}/seriesChain/${
			crumbed	
		}`;
	        const trackResult = await $i.db.write(trackingPath);
	        if(trackResult?.error) {
			return er({
				message: "Error in tracking",
				details: trackResult.error
			})
		}
	} else {
		return er({
			message: "couldn't find tracking breadcrumb",
			bready,
			seriesId, heichelId,
			code: "POST_ADD_FAILED",
			crumbed	
			
			
		})
	}
	
	// Add post to the series' posts object
        const writeResult = await $i.db.appendToObj(seriesPostsPath, {
            key: postId,
            value: postData
        });
        // Note: appendToObj might overwrite if key exists, which is unlikely here.
        // If it creates the path if non-existent, that's good. If not, we need ensure path exists.
        // Assuming $i.db.appendToObj handles path creation or we ensure series exists first.

        if (writeResult?.error) {
            throw new Error(`DB Error: ${writeResult.error.message || writeResult.error}`);
        }
       
		
        return { success: { postId, seriesId, title } };

    } catch (e) {
        console.error("Error in addPostToSeries:", e);
        return er({ code: "POST_ADD_FAILED", details: e.message, stack: e.stack });
    }
}

/**
 * @description Edits an existing post within its parent series.
 * @requires $_PUT: { aliasId, newTitle?, newContent?, dayuh? (merged) }
 * @requires params: heichelId, seriesId, postId
 */
async function editPostInSeries({ $i, heichelId, seriesId, postId }) {
    if (!loggedIn($i)) return er({ message: "NO_LOGIN" });

    const { aliasId, newTitle, newContent, dayuh } = $i.$_PUT;
    const override = !$i.$_PUT.dontOverride; // Default is to override fields

    if (!aliasId) return er({ code: "MISSING_PARAMS", details: "Requires aliasId" });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;
    const postPath = `${seriesPostsPath}`; // Path to the specific post entry within the object

    try {
        // Get current post data if needed (e.g., for merging dayuh or partial updates)
        // Assuming updateEntry can handle partial updates, or we fetch first.
        // Let's assume updateEntry needs the full new value. Fetch existing first.

        let existingPost;
        try {
            existingPost = await $i.db.getValue(postPath, postId); // Assumes get works on sub-keys of an object path
             if (!existingPost) throw new Error("Post not found");
        } catch(eGet) {
             // Fallback: get the whole posts object and extract
             existingPost = (await $i.db.get(seriesPostsPath, {
				propertyMap: {
					[postId]: true
				}
			 }))?.[postId];
			 
             if(!existingPost) {
                 return er({ code: "POST_NOT_FOUND", details: { heichelId, seriesId, postId, e:eGet.stack } });
             }
        }


        const updatedPostData = { ...existingPost }; // Start with existing data

        if (newTitle && typeof newTitle === "string" && newTitle.length <= 100) {
            updatedPostData.title = newTitle.trim();
        }
        if (newContent && typeof newContent === "string" && newContent.length <= 15784) {
            updatedPostData.content = newContent.trim();
        }
        if (dayuh && typeof dayuh === 'object') {
            if (override || !updatedPostData.dayuh) {
                updatedPostData.dayuh = dayuh;
            } else {
                // Merge dayuh properties
                updatedPostData.dayuh = { ...updatedPostData.dayuh, ...dayuh };
            }
        }
        updatedPostData.updatedAt = Date.now();

        // Use updateEntry to modify the post within the series' posts object
        const updateResult = await $i.db.updateEntry(seriesPostsPath, { key: postId, value: updatedPostData });

        if (updateResult?.error) {
            throw new Error(`DB Error: ${updateResult.error.message || updateResult.error}`);
        }

        return { success: { message: "Post updated", postId, wrote: { title: !!newTitle, content: !!newContent, dayuh: !!dayuh } } };

    } catch (e) {
        console.error("Error in editPostInSeries:", e);
        return er({ code: "POST_EDIT_FAILED", details: e.message, stack: e.stack });
    }
}

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

/**
 * @description Gets a single post's data from its parent series.
 * @requires params: heichelId, seriesId, postId
 */
async function getPostFromSeries({ $i, heichelId, seriesId, postId }) {
    // Add permission checks if necessary (e.g., verifyHeichelViewAuthority)
    const opts = myOpts($i); // For propertyMap if needed
    const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;
    const postPath = `${seriesPostsPath}`; // Path to the specific post entry
	var map = opts.propertyMap;
    try {
        let postData;
        try {
            postData = await $i.db.getValue(postPath, postId, map); // Assumes get works on sub-keys
        } catch (eGet) {
            // Fallback: get the whole posts object and extract
			var pm = opts?.propertyMap || {title:true,dayuh:true,content:true,author:true,id:true};
            const allPosts = await $i.db.get(seriesPostsPath+"/"+postId, {
				
				[postId]: pm
			});
            if (allPosts && allPosts[postId]) {
                postData = allPosts[postId];
            }
        }

        if (!postData) {
            return er({ code: "POST_NOT_FOUND", details: { heichelId, seriesId, postId } });
        }
        // Ensure id is present (it should be from addPostToSeries)
        if (!postData.id) postData.id = postId;

        return postData; // Return the specific post object

    } catch (e) {
        // Handle case where series or posts object doesn't exist
        if (e.message.includes("Path does not exist")) { // Or specific DB error code
            return er({ code: "POST_NOT_FOUND", details: { heichelId, seriesId, postId } });
        }
        console.error("Error in getPostFromSeries:", e);
        return er({ code: "POST_GET_FAILED", details: e.message });
    }
}

/**
 * @description Gets all posts (or just IDs) within a specific series.
 * @requires params: heichelId, seriesId
 * @optional query: details=true (to get full data), properties (like original)
 */
async function getPostsInSeries({ $i, heichelId, seriesId, withDetails = false, properties }) {
     // Add permission checks if necessary (e.g., verifyHeichelViewAuthority)
    const opts = myOpts($i); // Use if $i has propertyMap settings
    const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;

    try {

        const postIds = await $i.db.getObjectKeys(seriesPostsPath);
        if (!withDetails) {
            // Get only post IDs (keys of the posts object)
             if(postIds?.error) {
                 if(postIds.error.code === 'PATH_NOT_FOUND' || postIds.error.code === 'NOT_AN_OBJECT') return []; // Empty array if no posts path/object
                 throw new Error(`DB Error getting keys: ${postIds.error.message || postIds.error}`);
             }
            return postIds || [];
        } else {
			
            var pm = opts.propertyMap;
            if(pm) {
                var ob = {};
                postIds.forEach(q => {
                    ob[q] = pm
                })
                opts.propertyMap = ob;
            }
            // Get the full posts object
            const postsObject = await $i.db.get(seriesPostsPath, opts);
            if (
	            !postsObject || 
	            typeof postsObject !== 'object' ||
	            Buffer.isBuffer(postsObject)
	     ) {
                return []; // Return empty array if no posts or not an object
            }

             // Apply property filtering similar to original getPostsInHeichel if needed
            var posts = [];
			var k;
			var keys = Object.keys(postsObject);
			
			for(k of keys) {
				var c = postsObject[k];
				if(!c) continue;
				posts.push({
					id: k,
					...c
				})
			}
			let postsArray = posts;
			
			
			//let postsArray = Object.values(postsObject).filter(Boolean);
				
             // Add seriesId back if useful for context (already implicit)
             // postsArray.forEach(p => p.seriesId = seriesId);

            // Note: Order is not guaranteed with object keys. If order matters,
            // a separate ordered array of IDs needs to be maintained.
            // For simplicity, we return posts in the order Object.values provides.
            return postsArray;
        }

    } catch (e) {
        if (e.message.includes("Path does not exist") || e.message.includes("DB Error getting keys")) { // Or specific DB error codes
            return []; // Return empty if series/posts path doesn't exist
        }
        console.error("Error in getPostsInSeries:", e);
        return er({ code: "POSTS_GET_FAILED", details: e.message, stack: e.stack });
    }
}

/**
 * @description Filters posts within a series by a specific property value.
 * @requires params: heichelId, seriesId, propertyKey, propertyValue
 */
async function getPostsByProperty({ $i, heichelId, seriesId, propertyKey, propertyValue }) {
    if (!propertyKey && propertyKey !== 0) {
        return er({ message: "Property key needed", code: "PROP_KEY_NEEDED" });
    }

    const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;

    try {
        const postsObject = await $i.db.get(seriesPostsPath);

        if (!postsObject || typeof postsObject !== 'object') {
            return []; // No posts to filter
        }

        const filteredPostIds = Object.entries(postsObject)
            .filter(([postId, postData]) => postData && postData[propertyKey] == propertyValue) // Use == for flexibility or === for strictness
            .map(([postId, postData]) => postId); // Return IDs of matching posts

        return filteredPostIds;

    } catch (e) {
         if (e.message.includes("Path does not exist")) {
            return [];
         }
        console.error("Error in getPostsByProperty:", e);
        return er({ message: "Failed to filter posts by property", code: "POST_FILTER_FAILED", details: e.message });
    }
}



module.exports = {
	getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel,
	getHeichelosOfPostsOfAlias,
	getSeriesCreatedOfAliasInHeichel,
	getHeichelosOfSeriesCreatedOfAlias,
	getHeichelosOfCommetsOfAlias,
	getSeriesInHeichelOfCommetsOfAlias,
	getPostsOfCommentsInSeriesOfAlias,
	

	
    addPostToSeries,
    editPostInSeries,
    deletePostFromSeries,
    getPostFromSeries,
    getPostsInSeries,
    getPostsByProperty,
    getSubmittedPosts,
    approveSubmittedPost,
    denySubmittedPost,
    // Removed: getPost, addPostToHeichel, deletePost, editPostDetails, getPostsInHeichel (replaced by Series-centric versions)
    // Removed: detailedPostOperation (replace with specific GET/PUT/DELETE routes)
};
