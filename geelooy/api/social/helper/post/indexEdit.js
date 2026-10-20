//B"H
//Blessed is He
//Boruch Hashem
/**
 * Post editing (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { loggedIn, er } = require("../general.js");
const { verifyHeichelAuthority } = require("../heichel.js");
const { invalidateSeries } = require("./seriesReadCache.js");

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

        try { invalidateSeries(heichelId, seriesId); } catch (e) { /* ignore */ }

        return { success: { message: "Post updated", postId, wrote: { title: !!newTitle, content: !!newContent, dayuh: !!dayuh } } };

    } catch (e) {
        console.error("Error in editPostInSeries:", e);
        return er({ code: "POST_EDIT_FAILED", details: e.message, stack: e.stack });
    }
}

module.exports = { editPostInSeries };
