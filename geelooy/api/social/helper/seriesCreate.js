//B"H
//Blessed is He
//Boruch Hashem
/**
 * Series creation (relocated from series.js; parent/ID preparation lives in seriesCreatePrep.js).
 */
const { er, loggedIn } = require("./general.js");
const { verifyHeichelAuthority } = require("./heichel.js");
const { seriesPrateemPath, seriesSubSeriesPath, seriesPostsPath, aliasSeriesTrackingPath } = require("./seriesPaths.js");
const { prepareSeriesCreation } = require("./seriesCreatePrep.js");
const { addSubSeriesToParent } = require("./seriesSub.js");


/**
 * @description Creates a new series, initializes its structure, and adds it to its parent.
 * Ensures the parent (including 'root') exists before creation.
 * @requires $_POST: { aliasId, seriesName/title/name, description?, parentSeriesId? (defaults to 'root') }
 */
async function makeNewSeries({ $i, heichelId }) {
    // 1. Basic Checks & Auth
    if (!loggedIn($i)) return er({ message: "NO_LOGIN" });

    const { aliasId, description = "" } = $i.$_POST;
    const seriesName = ($i.$_POST.seriesName || $i.$_POST.title || $i.$_POST.name || "").trim();
    const parentSeriesId = $i.$_POST.parentSeriesId || "root";

    if (!aliasId || !seriesName) {
        return er({ code: "MISSING_PARAMS", details: "Requires aliasId and seriesName/title/name" });
    }
    if (seriesName.length > 100 || description.length > 888) {
        return er({ message: "Input too long", proper: { seriesName: 100, description: 888 } });
    }

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });
	var prep = await prepareSeriesCreation({
		$i, heichelId, parentSeriesId, aliasId, seriesName
	});
	if (!prep || typeof prep.seriesId !== "string") return prep;
	var seriesId = prep.seriesId;
	var newSeriesBasePath = prep.newSeriesBasePath;
    try {
        

		
        // 4. Create the new series structure (Parent/Root confirmed)
        const prateemData = {
            id: seriesId,
            name: seriesName,
            description,
            author: aliasId,
            parentSeriesId: parentSeriesId,
            createdAt: Date.now()
        };
        
        var seriesPrateemToWriteTo = seriesPrateemPath(heichelId, seriesId)
        await $i.db.write(seriesPrateemToWriteTo , prateemData);
      
      
        
        await $i.db.write(seriesSubSeriesPath(heichelId, seriesId), []);
        await $i.db.write(seriesPostsPath(heichelId, seriesId), {});

        // 5. Add this new series' ID to the parent's subSeries array
        // No need to check parent again, addSubSeriesToParent will handle array logic
        const addedToParent = await addSubSeriesToParent({
            $i, heichelId, parentSeriesId, childSeriesId: seriesId
        });

        if (addedToParent?.error) {
            // Attempt rollback: Delete the newly created series structure
            console.error(`Failed to add ${seriesId} to parent ${parentSeriesId}. Rolling back...`);
            await $i.db.delete(newSeriesBasePath).catch(err => console.error(`Rollback failed for ${seriesId}:`, err));
            throw new Error(`Failed to add to parent series: ${addedToParent.error.message || addedToParent.error}`);
        }

        // 6. Track series creation for the alias
        const trackingPath = aliasSeriesTrackingPath(aliasId, heichelId);
        const trackResult = await $i.db.syncKeyInObj(trackingPath, seriesId);
        if (trackResult?.error) {
            console.error(`Failed to track series ${seriesId} creation for alias ${aliasId}: ${trackResult.error}`);
            // Non-critical error, proceed but log it
        }

        // 7. Return Success
        return { success: {
			id: seriesId, 
			newSeriesID: seriesId,
			name: seriesName, 
			parentId: parentSeriesId 
		} };

    } catch (e) {
        // Catch errors from steps 4, 5, or rethrown errors from 3
        console.error("Error during makeNewSeries process:", e);
        // Attempt cleanup if error happened after step 4 started
        if (!e.code || (e.code !== 'PARENT_SERIES_NOT_FOUND' && e.code !== 'ROOT_ENSURE_FAILED')) {
             await $i.db.delete(newSeriesBasePath).catch(err => console.error("Cleanup failed after error:", err));
         }
        return er({ code: "SERIES_CREATE_FAILED", details: e.message, stack: e.stack });
    }
}

module.exports = { makeNewSeries };
