//B"H
//Blessed is He
//Boruch Hashem
/**
 * Verbatim try block of addPostToSeries: breadcrumb tracking, post write, cache invalidation.
 */
const { sp } = require("../_awtsmoos.constants.js");
const { er } = require("../general.js");
const { invalidateSeries } = require("./seriesReadCache.js");

async function writePostToSeries({ $i, heichelId, seriesId, aliasId, postId, postData, title, seriesPostsPath }) {
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

        try { invalidateSeries(heichelId, seriesId); } catch (e) { /* ignore */ }

        return { success: { postId, seriesId, title } };

    } catch (e) {
        console.error("Error in addPostToSeries:", e);
        return er({ code: "POST_ADD_FAILED", details: e.message, stack: e.stack });
    }
}

module.exports = { writePostToSeries };
