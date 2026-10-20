//B"H
//Blessed is He
//Boruch Hashem
/**
 * Listing posts in a series (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { er, myOpts } = require("../general.js");

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

module.exports = { getPostsInSeries };
