//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module CommentDeletionIndexCheck
 * @description Remaining-comments check (split from commentDeletion.js, verbatim).
 */

const {
    er,
    myOpts
} = require("../general.js");

	const { getPathAtSeries } = require("./commentPaths.js");

/**
 * @async
 * @function checkAliasHasAnyCommentsInSeries
 * @description Checks if an alias has *any* remaining comment files anywhere within a given series/heichel.
 * This is potentially expensive as it might involve listing many directories.
 * @returns {Promise<{success: boolean, error?: object}>} True if comments remain, false otherwise.
 */
async function checkAliasHasAnyCommentsInSeries($i, aliasId, heichelId, seriesId) {
    const seriesBasePath = getPathAtSeries({ heichelId, seriesId });
    if (!seriesBasePath) return { success: false, error: er("Cannot get series base path") };

    try {
        // We need to check both atPost and atComment paths within the series
        const potentialPaths = [
            `${seriesBasePath}/atPost`,
            `${seriesBasePath}/atComment` // This isn't quite right, atComment is nested under atPost/postId
        ];

        // Check atPost directly
        const atPostPath = `${seriesBasePath}/atPost`;
        const postsResult = await $i.db.get(atPostPath);
        if (postsResult.success && Array.isArray(postsResult.success)) {
            for (const postId of postsResult.success) {
                const aliasFilePath = `${atPostPath}/${postId}/${aliasId}`;
                const existsResult = await $i.db.exists(aliasFilePath);
                if (existsResult.success) return { success: true }; // Found one, no need to look further
                 if (existsResult.error && !(existsResult.error.code === 'NOT_FOUND' || existsResult.error.code === 404)) throw existsResult.error; // Real error

                 // Also check for comments on comments within this post
                  const atCommentPath = `${atPostPath}/${postId}/atComment`;
                  const commentsResult = await $i.db.get(atCommentPath);
                  if (commentsResult.success && Array.isArray(commentsResult.success)) {
                      for (const commentParentId of commentsResult.success) {
                           const aliasFilePathComment = `${atCommentPath}/${commentParentId}/${aliasId}`;
                           const existsCommentResult = await $i.db.exists(aliasFilePathComment);
                           if (existsCommentResult.success) return { success: true };
                            if (existsCommentResult.error && !(existsCommentResult.error.code === 'NOT_FOUND' || existsCommentResult.error.code === 404)) throw existsCommentResult.error;
                      }
                  } else if (commentsResult.error && !(commentsResult.error.code === 'NOT_FOUND' || commentsResult.error.code === 404)) {
                       throw commentsResult.error;
                  }
            }
        } else if (postsResult.error && !(postsResult.error.code === 'NOT_FOUND' || postsResult.error.code === 404)) {
             throw postsResult.error; // Real error listing posts
        }


        // If we got here, no comment file was found for the alias in this series
        return { success: false };

    } catch (e) {
        console.error(`Error checking for remaining comments for ${aliasId} in series ${seriesId}:`, e);
        // Fail safe: assume comments *might* still exist if we had an error checking
        return { success: false, error: er("Error checking remaining comments", { details: e.stack }) };
    }
}

module.exports = {
	checkAliasHasAnyCommentsInSeries,
};
