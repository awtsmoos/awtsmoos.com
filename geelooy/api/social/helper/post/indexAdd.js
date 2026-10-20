//B"H
//Blessed is He
//Boruch Hashem
/**
 * Post creation (relocated from post/index.js; tracking+write lives in indexAddWrite.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { loggedIn, er } = require("../general.js");
const { shouldSubmitPostForApproval, submitPostForApproval } = require("./submissions.js");
const { writePostToSeries } = require("./indexAddWrite.js");

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
	return await writePostToSeries({
		$i, heichelId, seriesId, aliasId, postId, postData, title, seriesPostsPath
	});
}

module.exports = { addPostToSeries };
