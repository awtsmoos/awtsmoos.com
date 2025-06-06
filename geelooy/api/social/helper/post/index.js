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

/**
 * @description Adds a new post directly into its parent series' post object.
 * @requires $_POST: { aliasId, title, content, seriesId (parent), dayuh? }
 */
async function addPostToSeries({ $i, heichelId, seriesId}) {
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

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) {
        return er({ code: "NO_AUTH", details: `Alias ${aliasId} cannot post to heichel ${heichelId}` });
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

        // Track the post creation for the alias
        const trackingPath = `${sp}/aliases/${aliasId}/postsSubmitted/inHeichel/${heichelId}/inSeries/${seriesId}`;
        const trackResult = await $i.db.syncKeyInObj(trackingPath, postId); // Store postId as key, maybe value = true
        if (trackResult?.error) {
            // Log error but don't necessarily fail the whole operation
            console.error(`Failed to track post ${postId} for alias ${aliasId}: ${trackResult.error}`);
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
        const updateResult = await $i.db.updateEntry(seriesPostsPath, postId, updatedPostData);

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
 * @description Deletes a post from its parent series.
 * @requires $_DELETE: { aliasId }
 * @requires params: heichelId, seriesId, postId
 */
async function deletePostFromSeries({
     $i, heichelId, seriesId, postId,
     userid
}) {
    const aliasId = $i.$_POST.aliasId || $i.$_DELETE.aliasId;
    if (!aliasId) return er({ code: "MISSING_PARAMS", details: "Requires aliasId" });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;

    try {
        // Optionally: Get post author before deleting for tracking removal
        let author = aliasId; // Assume deleter is author if not fetched
        try {
            const postData = (await $i.db.getValue(`${seriesPostsPath}`, { propertyMap: { 
				[postId]: {
					author: true 
				}
			}}))?.[postId];
             if (postData?.author) author = postData.author;
        } catch (eGet) {
             console.warn(`Could not fetch post author before deleting ${postId}: ${eGet.message}`);
             // Fallback: Try getting the whole object
             try {
                const allPosts = await $i.db.get(seriesPostsPath);
                if(allPosts && allPosts[postId]) author = allPosts[postId].author || author;
             } catch(eGetAll) {/* ignore */}
        }


        // Delete the post entry from the series' posts object
        const deleteResult = await $i.db.deleteEntry(seriesPostsPath, postId);

        if (deleteResult?.error && deleteResult.error.code !== 'ENTRY_NOT_FOUND') { // Ignore if already deleted
            throw new Error(`DB Error: ${deleteResult.error.message || deleteResult.error}`);
        }
        if (deleteResult?.error?.code === 'ENTRY_NOT_FOUND') {
             console.warn(`Post ${postId} already deleted or never existed.`);
             // Optionally return success here if idempotent deletion is desired
        }


        // Untrack the post for the author
        const trackingPath = `${sp}/aliases/${author}/postsSubmitted/inHeichel/${heichelId}/inSeries/${seriesId}`;
        try {
            // Assuming syncKeyInObj uses objects, we need a way to remove the key.
            // If db has removeKeyFromObj or similar, use it. Otherwise, fetch, modify, write.
            // Let's use deleteEntry on the tracking object path if the DB supports it.
             const untrackResult = await $i.db.deleteEntry(trackingPath, postId);
             // If deleteEntry doesn't work on tracking objects, need alternative like:
             /*
             let trackingObj = await $i.db.get(trackingPath);
             if (trackingObj && trackingObj[postId]) {
                 delete trackingObj[postId];
                 await $i.db.write(trackingPath, trackingObj, { deleteSelfIfEmpty: true }); // Assumes write has this option
             }
             */
             if (untrackResult?.error && untrackResult.error.code !== 'ENTRY_NOT_FOUND') {
                 console.error(`Failed to untrack post ${postId} for alias ${author}: ${untrackResult.error}`);
             }
             // Clean up empty parent tracking objects if needed (complex, maybe skip for now)

        } catch (eUntrack) {
            console.error(`Error untracking post ${postId} for alias ${author}: ${eUntrack}`);
        }

        // Delete associated comments
        const commentDeletionResult = await deleteAllCommentsOfParent({
            $i, heichelId, seriesId, // Pass seriesId
            parentId: postId, parentType: "post",
            userid
        });
        if (commentDeletionResult?.error && commentDeletionResult.error.code !== "NO_COM") {
             console.error(`Issue deleting comments for post ${postId}:`,commentDeletionResult.error);
             return er({
                message: "Issue deleting comments for post",
                specifics: commentDeletionResult.error
             })
        }

        return { success: { message: "Post deleted", postId, commentsDeleted: !commentDeletionResult?.error } };

    } catch (e) {
        console.error("Error in deletePostFromSeries:", e);
        return er({ code: "POST_DELETE_FAILED", details: e.message, stack: e.stack });
    }
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

    try {
        let postData;
        try {
            postData = await $i.db.getValue(postPath, postId, opts); // Assumes get works on sub-keys
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
            if (!postsObject || typeof postsObject !== 'object') {
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
				
             // TODO: Re-implement property filtering if required, similar to the original getPostsInHeichel
             /* Example adaptation:
             if (properties && typeof properties === 'object') {
                 postsArray = postsArray.map(post => {
                     const filteredPost = {};
                     for (const prop in properties) {
                         if (post.hasOwnProperty(prop)) {
                             const rule = properties[prop];
                             if (rule === true) {
                                 filteredPost[prop] = post[prop];
                             } else if (typeof rule === 'number' && typeof post[prop] === 'string') {
                                 filteredPost[prop] = post[prop].substring(0, rule);
                             } // Add other rules if needed
                         }
                     }
                     // Always include essential fields like id?
                     if (!filteredPost.id && post.id) filteredPost.id = post.id;
                     return filteredPost;
                 });
             }
             */
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
    addPostToSeries,
    editPostInSeries,
    deletePostFromSeries,
    getPostFromSeries,
    getPostsInSeries,
    getPostsByProperty,
    // Removed: getPost, addPostToHeichel, deletePost, editPostDetails, getPostsInHeichel (replaced by Series-centric versions)
    // Removed: detailedPostOperation (replace with specific GET/PUT/DELETE routes)
};