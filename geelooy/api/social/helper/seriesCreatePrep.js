//B"H
//Blessed is He
//Boruch Hashem
/**
 * Verbatim try block of makeNewSeries: parent/root check plus unique ID generation. Returns the er() result on failure, or { seriesId, newSeriesBasePath } on success.
 */
const { er } = require("./general.js");
const { seriesBasePath, seriesPrateemPath, seriesSubSeriesPath } = require("./seriesPaths.js");
const { ensureRootSeriesExists } = require("./seriesRoot.js");

async function prepareSeriesCreation({ $i, heichelId, parentSeriesId, aliasId, seriesName }) {
	var newSeriesBasePath
	var seriesId;
	try {
		// 2. Ensure Parent/Root Exists *Before* Creating New Series
        if (parentSeriesId === "root") {
            const rootResult = await ensureRootSeriesExists({ $i, heichelId });
            if (!rootResult.success) {
                // Error is already logged in ensureRootSeriesExists
                return er({ code: "ROOT_ENSURE_FAILED", details: "Could not verify or create root series." });
            }
        } else {
            // Check non-root parent existence
            try {
                const parentExists = await $i.db.get(seriesPrateemPath(heichelId, parentSeriesId), { propertyMap: { id: true } });
                if (!parentExists) {
                    return er({ code: "PARENT_SERIES_NOT_FOUND", details: { heichelId, parentSeriesId } });
                }
            } catch (e) {
                // Handle DB error during check
                 if (e.message?.includes("Path does not exist") || e.code === 'PATH_NOT_FOUND') {
                      return er({ code: "PARENT_SERIES_NOT_FOUND", details: { heichelId, parentSeriesId } });
                 }
                 console.error(`Error checking parent series ${parentSeriesId}: ${e.message}`);
                 return er({ code: "PARENT_CHECK_FAILED", details: e.message });
             }
        }
		
	    // 3. Generate New Series ID
		var inputId = $i.$_POST.inputId;
		if(!inputId || inputId == "undefined") {
			inputId = $i.utils.generateId(seriesName, false, 0);
	
			
		}
		inputId = inputId.trim()
		if(!inputId) {
			inputId = `BH_${aliasId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
		}
		//inputId = $i.utils.generateId(inputId, false, 0)
		var parentSubSeriesIDs = await $i.db.get(
			seriesSubSeriesPath(heichelId, parentSeriesId)
		);
		if(!parentSubSeriesIDs) {
			parentSubSeriesIDs = [];
		}

		if(!Array.isArray(parentSubSeriesIDs)) {
			return er({
				message: "Issue with array",
				parentSubSeriesIDs
			})
		}
		var k = inputId;
		var times = 0;
		while(parentSubSeriesIDs.includes(k)) {
			times++
			k = inputId + "_" + times;
			
		}
		seriesId = inputId;
		newSeriesBasePath = seriesBasePath(heichelId, seriesId); // For potential rollback

	} catch(e) {
		return er({
			code: "WHAT",
			stack: e.stack
		})
	}
	return { seriesId, newSeriesBasePath };
}

module.exports = { prepareSeriesCreation };
