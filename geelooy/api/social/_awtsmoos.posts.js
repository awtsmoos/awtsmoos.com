/**
 * B"H
 *
 * Posts API Endpoints.
 * IMPORTANT: Posts are now accessed *through* their parent series.
 * Standalone post endpoints are deprecated.
 */

const {
    addPostToSeries,
    editPostInSeries,
    deletePostFromSeries,
    getPostFromSeries,
    getPostsInSeries,
    getPostsByProperty,

	getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel,
	getHeichelosOfPostsOfAlias,
	
    // Other helpers if needed by routes
    er // Import error helper
} = require("./helper/index.js");

const { loggedIn } = require("./helper/general.js"); // For auth checks if needed directly

module.exports = ({ $i, userid } = {}) => ({

	"/aliases/:alias/postsMade/heichel/:heichel/pathToSeries/:pathive": async vars => {
		var pathic = "";
		try {
			pathic = decodeURIComponent(
				Buffer.from(
				
					vars
					.pathive || "",
					"base64"
				).toString("utf-8")
			)
		} catch(e) {
		}
		return await getPostsOfAliasInSeries({
			$i,
			aliasId: vars.alias,
			crumbpath: pathic,
			//seriesId: vars.series,
			heichelId: vars.heichel,
			withDetails: true
		})
	},
	"/aliases/:alias/postsMade/heichelos": async vars => {
		return await getHeichelosOfPostsOfAlias({
			$i,
			aliasId: vars.alias
		})
	},
	"/aliases/:alias/postsMade/heichel/:heichel/series": async vars => {
		return await getSeriesOfPostsOfAliasInHeichel({
			$i,
			aliasId: vars.alias,
			heichelId: vars.heichel
		})
	},

    "/heichelos/:heichel/submittedPosts": async vars => {
        if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
        return await getSubmittedPosts({ $i, heichelId: vars.heichel });
    },

    "/heichelos/:heichel/submittedPosts/approve": async vars => {
        if ($i.request.method !== "POST") return er({ code: "METHOD_NOT_ALLOWED" });
        return await approveSubmittedPost({
            $i,
            heichelId: vars.heichel,
            postId: $i.$_POST.postId,
            approverAliasId: $i.$_POST.aliasId,
            addPostToSeries
        });
    },

    "/heichelos/:heichel/submittedPosts/deny": async vars => {
        if ($i.request.method !== "POST" && $i.request.method !== "DELETE") return er({ code: "METHOD_NOT_ALLOWED" });
        const body = $i.$_POST || $i.$_DELETE || {};
        return await denySubmittedPost({
            $i,
            heichelId: vars.heichel,
            postId: body.postId,
            approverAliasId: body.aliasId
        });
    },
    /**
     * @endpoint POST /heichelos/:heichel/series/:series/posts
     * @description Adds a new post to the specified series.
     * @requires Body: { aliasId, title, content, dayuh? }
	 * 
	 *  * @endpoint GET /heichelos/:heichel/series/:series/posts
     * @description Gets posts within a series. Returns IDs by default.
     * @query details=true - Returns full post objects.
     * @query properties={...} - Apply property filtering (if implemented in helper).
     */
    "/heichelos/:heichel/series/:series/posts": async (v) => {
		if ($i.request.method == "GET") {
         const withDetails = $i.$_GET.details === 'true';
         const properties = $i.$_GET.properties ? JSON.parse($i.$_GET.properties) : null; // Basic query param parsing
         return getPostsInSeries({
             $i,
             heichelId: v.heichel,
             seriesId: v.series,
             withDetails,
             properties
         });
		}
        if ($i.request.method !== "POST") return er({ code: "METHOD_NOT_ALLOWED" });
        // $_POST should contain aliasId, title, content
        $i.$_POST.seriesId = v.series; // Ensure seriesId from route is used
        return addPostToSeries({
            $i,
            heichelId: v.heichel,
			seriesId: v.series
        });
    },


    /**
     * @endpoint GET /heichelos/:heichel/series/:series/posts/details
     * @description Convenience endpoint. Gets full post objects within a series.
     * (Equivalent to GET /posts?details=true)
     */
    "/heichelos/:heichel/series/:series/posts/details": async (v) => {
        if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED",
			method: $i.request.method				   
		});
        return getPostsInSeries({
            $i,
            heichelId: v.heichel,
            seriesId: v.series,
            withDetails: true
        });
    },

    /**
     * @endpoint GET /heichelos/:heichel/series/:series/post/:post
     * @description Gets a specific post by its ID within its series.
     */
	 /**
     * @endpoint PUT /heichelos/:heichel/series/:series/post/:post
     * @description Edits a specific post.
     * @requires Body: { aliasId, newTitle?, newContent?, dayuh? }
     */
	  /**
     * @endpoint DELETE /heichelos/:heichel/series/:series/post/:post
     * @description Deletes a specific post.
     * @requires Body: { aliasId } (can also be query/header depending on convention)
     */
    "/heichelos/:heichel/series/:series/post/:post": async (v) => {
        if ($i.request.method === "GET") {
            return getPostFromSeries({
                $i,
                heichelId: v.heichel,
                seriesId: v.series,
                postId: v.post
            });
        }
        if ($i.request.method == "PUT") {
         // $_PUT should contain aliasId and updates
         return editPostInSeries({
             $i,
             heichelId: v.heichel,
             seriesId: v.series,
             postId: v.post
         });
		}

		if ($i.request.method !== "DELETE") return er({ code: "METHOD_NOT_ALLOWED" });
        // Ensure aliasId is available, maybe from query or body
        if (!$i.$_DELETE) $i.$_DELETE = {}; // Ensure object exists
        $i.$_DELETE.aliasId = $i.$_DELETE.aliasId || $i.$_QUERY.aliasId /* or from authenticated user */;
        if (!$i.$_DELETE.aliasId) return er({code: "AUTH_NEEDED", details: "aliasId required for deletion"});

        return deletePostFromSeries({
            $i,
            heichelId: v.heichel,
            seriesId: v.series,
            postId: v.post,
            userid
        });

    },

   
	"/heichelos/:heichel/series/:series/post/:post/delete": async (v) => {
      
        return deletePostFromSeries({
            $i,
            heichelId: v.heichel,
            seriesId: v.series,
            postId: v.post,
            userid
        });
    },


     /**
      * @endpoint GET /heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal
      * @description Filters posts in a series by property value. Returns matching post IDs.
      */
     "/heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal": async v => {
         if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
         let pv = v.propVal;
         let pk = v.propKey;
         try { pv = decodeURIComponent(pv); } catch (e) {}
         try { pk = decodeURIComponent(pk); } catch (e) {}

         return getPostsByProperty({
             $i,
             heichelId: v.heichel,
             seriesId: v.series,
             propertyKey: pk,
             propertyValue: pv
         });
     },


    // --- Deprecated Standalone Post Routes ---
    /*
    "/heichelos/:heichel/posts": DEPRECATED - Use /heichelos/:heichel/series/:series/posts
    "/heichelos/:heichel/posts/details": DEPRECATED - Use /heichelos/:heichel/series/:series/posts?details=true
    "/heichelos/:heichel/post/:post": DEPRECATED - Use /heichelos/:heichel/series/:series/post/:post
    "/heichelos/:heichel/post/:post/delete": DEPRECATED - Use DELETE on /heichelos/:heichel/series/:series/post/:post
    */
    // Add catch-all or specific handlers for deprecated routes to return errors if desired.

});
