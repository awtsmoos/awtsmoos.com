//B"H
//Blessed is He
//Boruch Hashem
/**
 * Single-post retrieval (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
// B"H 2026-11-13 (Living Yeshiva simulation): shard fallback for sim-*
// posts, which live in the sim vessel, not the series family vessel.
// shardStore.get already falls back to the sim vessel (commit b80521273).
let simShardStore = null;
function getSimShardStore() {
  if (simShardStore) return simShardStore;
  try { simShardStore = require("../awtsmoosDb/shardStore.js"); } catch { simShardStore = null; }
  return simShardStore;
}
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
            // SIM_SHARD_FALLBACK: sim-* posts live in the sim vessel, not
            // the series family vessel. Try the packed shard (core) via
            // shardStore, which itself falls back to the sim vessel.
            if (typeof postId === 'string' && postId.startsWith('sim-')) {
                try {
                    const store = getSimShardStore();
                    if (store) {
                        const rec = store.get({ shard: 'core', parts: ['records', '/posts/' + heichelId + '/' + postId] });
                        const env = rec && (rec.value || rec);
                        const post = env && (env.value || env);
                        if (post && post.postId) postData = post;
                    }
                } catch { /* fall through to NOT_FOUND */ }
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
