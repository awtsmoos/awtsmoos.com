//B"H
//Blessed is He
//Boruch Hashem
/**
 * Single-post retrieval (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { er, myOpts } = require("../general.js");

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

module.exports = { getPostFromSeries };
