/**
 * B"H
 * Series API Endpoints
 */

const {
    // Series Functions
    makeNewSeries,
    editSeriesDetails,
    getSeries,
    getSubSeries,
    deleteSeriesFromHeichel,
    changeSubSeriesFromOneSeriesToAnother,
    editSubSeriesInSeries,
    getAllSeriesInHeichel,
    getSeriesByProperty,

    // Post Functions (used by series routes sometimes)
    getPostsInSeries,
    getPostsByProperty,

    // General
    er
} = require("./helper/index.js");

const { sp } = require("./helper/_awtsmoos.constants.js"); // If needed
const { getDirectSeriesPrateem } = require("./helper/series/directSeriesPrateem.js");

module.exports = ({ $i, userid } = {}) => ({

    /**
     * @endpoint POST /heichelos/:heichel/addNewSeries
     * @description Creates a new series.
     * @requires Body: { aliasId, seriesName/title/name, description?, parentSeriesId? ('root') }
     */
    "/heichelos/:heichel/addNewSeries": async (v) => {
        if ($i.request.method !== "POST") return er({ code: "METHOD_NOT_ALLOWED" });
        return await makeNewSeries({
            $i,
            heichelId: v.heichel
        });
    },

    /**
     * @endpoint GET /heichelos/:heichel/series/
     * @description Gets the direct sub-series (prateem only) of the 'root' series.
     */
    "/heichelos/:heichel/series/": async v => {
        if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
        // Get sub-series of root, with details=true (fetches prateem for each)
        return await getSubSeries({
            $i,
            heichelId: v.heichel,
            parentSeriesId: "root",
            withDetails: true // Get prateem for each sub-series
        });
    },

    /**
     * @endpoint GET /heichelos/:heichel/series/:series
     * @description Gets basic details (prateem) of a specific series.
     * @query details=true - Also fetches subSeries IDs and full post data.
     */
    "/heichelos/:heichel/series/:series": async v => {
        if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
        const withDetails = $i.$_GET.details === 'true';
        if (!withDetails) return await getDirectSeriesPrateem({ $i, heichelId: v.heichel, seriesId: v.series });
        return await getSeries({
            $i,
            heichelId: v.heichel,
            seriesId: v.series,
            withDetails // Pass detail flag
            // Can add property map support via query param if needed
        });
    },

    
	
	 /**
     * @endpoint GET /heichelos/:heichel/series/:series/details
     * @description Convenience endpoint. Gets full details of a series (prateem, subSeries IDs, posts).
     * (Equivalent to GET /series/:series?details=true)
     */
    /**
     * @endpoint POST /heichelos/:heichel/series/:series/details
     * @description Gets details for multiple series IDs provided in the body.
     * @requires Body: { seriesIds: [...] }
     */
     "/heichelos/:heichel/series/:series/details": async v => { // Note: Route seems specific, but logic is general
        if ($i.request.method == "GET") {
         return await getSeries({
             $i,
             heichelId: v.heichel,
             seriesId: v.series,
             withDetails: true
         }); 
		}
		if ($i.request.method !== "POST") 
            return er({ code: "METHOD_NOT_ALLOWED" });
        const ids = Array.isArray($i.$_POST.seriesIds)
            ? $i.$_POST.seriesIds
            : String($i.$_POST.seriesIds || "").split(",").filter(Boolean);
        const details = {};
        for (const id of ids) {
            details[id] = await getSeries({ $i, heichelId: v.heichel, seriesId: id, withDetails: true });
        }
        return { success: details };
     },
    "/heichelos/:heichel/series/:series/subSeriesDetails": async v => { // Note: Route seems specific, but logic is general
        return await getSeries({
             $i,
             heichelId: v.heichel,
             seriesId: v.series,
             withSubSeriesDetails: true
         });  
   
        
        

    },
    
        

    /**
     * @endpoint GET /heichelos/:heichel/series/:series/subSeries
     * @description Gets the IDs of the direct sub-series of the specified series.
     * @query details=true - Gets prateem data for each sub-series instead of just IDs.
     */
    "/heichelos/:heichel/series/:series/subSeries": async v => {
        if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
        const withDetails = $i.$_GET.details;
       // return {v,withDetails,GET:$i.$_GET}
        return await getSubSeries({
            $i,
            heichelId: v.heichel,
            parentSeriesId: v.series,
            withDetails
        });
    },

    /**
     * @endpoint GET /heichelos/:heichel/series/:series/subSeries/details
     * @description Convenience endpoint. Gets prateem data for direct sub-series.
     * (Equivalent to GET /subSeries?details=true)
     */
     "/heichelos/:heichel/series/:series/subSeries/details": async v => {
         if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
         return await getSubSeries({
             $i,
             heichelId: v.heichel,
             parentSeriesId: v.series,
             withDetails: true
         });
     },

    /**
     * @endpoint GET /heichelos/:heichel/series/:series/parent
     * @description Gets the prateem of the parent series.
     */
    "/heichelos/:heichel/series/:series/parent": async v => {
        if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });

        // Get current series' parent ID
        const currentSeries = await getSeries({
            $i, heichelId: v.heichel, seriesId: v.series,
            properties: { parentSeriesId: true }
        });

        if (currentSeries?.error) return currentSeries; // Propagate error
        const parentId = currentSeries?.prateem?.parentSeriesId;

        if (!parentId || parentId === "root") {
            // Return root representation or null/empty
            return { prateem: { id: "root", name: "Root", isRoot: true } };
            // return null; // Or appropriate response for no parent
        }

        // Get parent's prateem
        return await getSeries({
            $i, heichelId: v.heichel, seriesId: parentId,
            withDetails: false // Just get prateem
        });
    },

    /**
     * @endpoint GET /heichelos/:heichel/series/:series/breadcrumb
     * @description Gets the ancestor series path from the current series up to root.
     */
    "/heichelos/:heichel/series/:series/breadcrumb": async v => {
         if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
         try {
             const breadcrumb = [];
             let currentId = v.series;
             const maxDepth = 20; // Safety break
             let depth = 0;

             while (currentId && currentId !== "root" && depth < maxDepth) {
                 const seriesData = await getSeries({
                     $i, heichelId: v.heichel, seriesId: currentId,
                     properties: { parentSeriesId: true, name: true, id: true } // Get needed fields
                 });

                 if (seriesData?.error) {
                      // Stop if a series in the chain is not found
                      console.error(`Breadcrumb error: Series ${currentId} not found.`);
                      breadcrumb.push({ id: currentId, name: "[Not Found]", error: true });
                      break;
                  }

                 // Add current series (excluding root itself in the loop)
                 if (seriesData.prateem) {
                      breadcrumb.push({ // Only push essential info
                          id: seriesData.prateem.id || currentId,
                          name: seriesData.prateem.name || "[Unnamed]"
                      });
                  } else {
                      // Should not happen if no error, but handle defensively
                      breadcrumb.push({ id: currentId, name: "[Data Error]", error: true });
                       break;
                   }


                 currentId = seriesData.prateem.parentSeriesId; // Move up
                 depth++;
             }

             if (depth >= maxDepth) console.warn("Breadcrumb generation hit max depth limit.");

             // Add root at the end (or beginning if preferred)
             breadcrumb.push({ id: "root", name: "Root" });

             return breadcrumb.reverse(); // Reverse to show Root -> ... -> Current

         } catch (e) {
             console.error("Breadcrumb generation failed:", e);
             return er({ code: "BREADCRUMB_FAILED", details: e.message });
         }
     },


    // --- Combined Series/Post Endpoints (Already in _awtsmoos.posts.js or here) ---

    /**
     * @endpoint GET /heichelos/:heichel/series/:series/posts
     * @description Gets posts within a series (IDs or details). Handled in _awtsmoos.posts.js
     */
     // Note: Route definition might exist in both files. Ensure only one handles it.
     // Assuming _awtsmoos.posts.js handles this. If defined here, remove from posts.js.


    /**
     * @endpoint GET /heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal
     * @description Filters posts within a series. Handled in _awtsmoos.posts.js
     */
     // Assuming _awtsmoos.posts.js handles this.


     /**
      * @endpoint GET /heichelos/:heichel/series/:series/filterSeriesBy/:propKey/:propVal
      * @description Filters direct sub-series by a property in their prateem. Returns matching sub-series IDs.
      */
     "/heichelos/:heichel/series/:series/filterSeriesBy/:propKey/:propVal": async v => {
         if ($i.request.method !== "GET") return er({ code: "METHOD_NOT_ALLOWED" });
         let pv = v.propVal;
         let pk = v.propKey;
         try { pv = decodeURIComponent(pv); } catch (e) {}
         try { pk = decodeURIComponent(pk); } catch (e) {}

         return getSeriesByProperty({
             $i,
             heichelId: v.heichel,
             parentSeriesId: v.series,
             propertyKey: pk,
             propertyValue: pv
         });
     },

    // --- Modification Endpoints ---

    /**
     * @endpoint PUT /heichelos/:heichel/series/:series/editSeriesDetails
     * @description Edits the prateem (name, description) of a series.
     * @requires Body: { aliasId, description?, seriesName/name/title? }
     */
    "/heichelos/:heichel/series/:series/editSeriesDetails": async (v) => {
        if ($i.request.method !== "PUT") return er({ code: "METHOD_NOT_ALLOWED" });
        // $_PUT should contain aliasId and updates
        return editSeriesDetails({
            $i,
            heichelId: v.heichel,
            seriesId: v.series
        });
    },

    /**
     * @endpoint PUT /heichelos/:heichel/series/:series/changeSubSeriesInSeries
     * @description Replaces the entire list of sub-series for the given series.
     * @requires Body: { aliasId, subSeriesIDs: [...] }
     */
    "/heichelos/:heichel/series/:series/changeSubSeriesInSeries": async (v) => {
        if ($i.request.method !== "PUT") return er({ code: "METHOD_NOT_ALLOWED" });
        return editSubSeriesInSeries({
            $i,
            heichelId: v.heichel,
            seriesId: v.series
        });
    },

    /**
     * @endpoint POST /heichelos/:heichel/series/:seriesFrom/moveSubSeriesTo/:seriesTo
     * @description Moves sub-series from one parent to another.
     * @requires Body: { aliasId, subSeriesIDs: [...] }
     */
    "/heichelos/:heichel/series/:seriesFrom/moveSubSeriesTo/:seriesTo": async (v) => {
         if ($i.request.method !== "POST") return er({ code: "METHOD_NOT_ALLOWED" });
         return changeSubSeriesFromOneSeriesToAnother({
             $i,
             heichelId: v.heichel,
             seriesFromId: v.seriesFrom,
             seriesToId: v.seriesTo
         });
     },
     
     /**
     * @endpoint DELETE /heichelos/:heichel/series/:parentSeriesId/deleteSubSeries/:seriesId
     * @description Explicitly deletes a sub-series from a known parent.
     * @requires Body: { aliasId }
     */
    "/heichelos/:heichel/series/:parentSeriesId/deleteSubSeries/:seriesId": async (v) => {
        // This endpoint can be triggered by POST (forms) or DELETE (JS clients)
        if ($i.request.method !== "DELETE" && $i.request.method !== "POST") {
            return er({ code: "METHOD_NOT_ALLOWED" });
        }
         
        // Get authorizing aliasId from the request body
        if (!$i.$_DELETE) $i.$_DELETE = $i.$_POST || {};
        const aliasId = $i.$_POST.aliasId || $i.$_DELETE.aliasId;
        if (!aliasId) return er({code: "AUTH_NEEDED", details: "aliasId required"});
        $i.$_POST.aliasId = aliasId; // Ensure it's available for the helper

        return deleteSeriesFromHeichel({
            $i,
            userid,
            heichelId: v.heichel,
            parentSeriesId: v.parentSeriesId, // <-- The EXPLICIT parent is now passed in
            seriesId: v.seriesId               // The series to be deleted
        });
    },
    
    /**
     * @endpoint DELETE /heichelos/:heichel/series/:parentSeriesId/deleteSubSeries/:seriesId
     * @description Explicitly deletes a sub-series from a known parent.
     * @requires Body: { aliasId }
     */
    "/heichelos/:heichel/series/:parentSeriesId/clearSubSeries/:seriesId": async (v) => {
        // This endpoint can be triggered by POST (forms) or DELETE (JS clients)
        if ($i.request.method !== "DELETE" && $i.request.method !== "POST") {
            return er({ code: "METHOD_NOT_ALLOWED" });
        }
         
        // Get authorizing aliasId from the request body
        if (!$i.$_DELETE) $i.$_DELETE = $i.$_POST || {};
        const aliasId = $i.$_POST.aliasId || $i.$_DELETE.aliasId;
        if (!aliasId) return er({code: "AUTH_NEEDED", details: "aliasId required"});
        $i.$_POST.aliasId = aliasId; // Ensure it's available for the helper

        return deleteSeriesFromHeichel({
            $i,
            userid,
            heichelId: v.heichel,
            deleteSelf: false,
            parentSeriesId: v.parentSeriesId, // <-- The EXPLICIT parent is now passed in
            seriesId: v.seriesId               // The series to be deleted
        });
    },


    /**
     * @endpoint DELETE /heichelos/:heichel/deleteSeries/:seriesId
     * @description Deletes a series and all its contents (posts, sub-series recursively).
     * @requires Body: { aliasId } (or query/header for auth)
     */
    "/heichelos/:heichel/deleteSeries/:seriesId": async (v) => {
       return er({
	       message: "API HAS MOVED",
	       moved: "/heichelos/:heichel/series/:parentSeriesId/deleteSubSeries/:seriesId"
       })
    },


    // --- Deprecated / Changed Routes ---
    /*
    "/heichelos/:heichel/addContentToSeries": DEPRECATED - Use POST /../addNewSeries or POST /../posts
    "/heichelos/:heichel/deleteContentFromSeries": DEPRECATED - Use DELETE /../deleteSeries/:id or DELETE /../post/:id
    "/heichelos/:heichel/series/:series/changePostsInSeries": DEPRECATED - Post order not managed this way.
    "/heichelos/:heichel/deleteSeriesFromHeichel/:seriesId": Renamed to /deleteSeries/:seriesId for clarity.
    */

});