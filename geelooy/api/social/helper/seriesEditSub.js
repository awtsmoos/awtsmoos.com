//B"H
//Blessed is He
//Boruch Hashem
/**
 * Replacing a series' sub-series list (relocated verbatim from series.js).
 */
const { er } = require("./general.js");
const { verifyHeichelAuthority } = require("./heichel.js");
const { seriesPrateemPath, seriesSubSeriesPath } = require("./seriesPaths.js");

/**
 * @description Replaces the entire list of sub-series for a given series.
 * Useful for reordering or bulk setting.
 * @requires $_PUT: { aliasId, subSeriesIDs (array, the new complete list) }
 */
async function editSubSeriesInSeries({ $i, heichelId, seriesId }) {
    const { aliasId, subSeriesIDs } = $i.$_PUT;

    if (!aliasId || !Array.isArray(subSeriesIDs)) {
        return er({ code: "MISSING_PARAMS", details: "Requires aliasId and subSeriesIDs (array)" });
    }

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    const subSeriesP = seriesSubSeriesPath(heichelId, seriesId);
    const results = { updated: [], errors: [] };

    try {
        // 1. Write the new array of subSeries IDs
        // Basic validation: check if IDs look reasonable? (optional)
        const writeResult = await $i.db.write(subSeriesP, subSeriesIDs);
        if (writeResult?.error) {
            throw new Error(`DB write error: ${writeResult.error.message || writeResult.error}`);
        }

        // 2. Update parentSeriesId in all specified sub-series
        // This ensures consistency, even if some were already children.
        for (const subId of subSeriesIDs) {
            const subPrateemPath = seriesPrateemPath(heichelId, subId);
            try {
                const prateem = await $i.db.get(subPrateemPath);
                if (prateem && prateem.parentSeriesId !== seriesId) { // Only update if parent differs
                     prateem.parentSeriesId = seriesId;
                     prateem.updatedAt = Date.now();
                     const updatePrateem = await $i.db.write(subPrateemPath, prateem);
                     if (updatePrateem?.error) {
                         results.errors.push(`Failed to update parentId for ${subId}: ${updatePrateem.error}`);
                     } else {
                         results.updated.push(subId);
                     }
                 } else if (!prateem) {
                      results.errors.push(`Prateem not found for ${subId}, cannot update parentId.`);
                  } else {
                      // Parent ID already correct, no update needed
                      results.updated.push(subId); // Count as successfully processed
                  }
            } catch (ePrat) {
                 results.errors.push(`Error updating parentId for ${subId}: ${ePrat.message}`);
             }
        }

        if (results.errors.length > 0) {
             return er({ code: "SUB_SERIES_EDIT_INCOMPLETE", updatedList: subSeriesIDs, errors: results.errors });
         }

        return { success: { message: "Sub-series list updated", seriesId, newList: subSeriesIDs } };

    } catch (e) {
        console.error("Error editing sub-series list:", e);
        return er({ code: "SUB_SERIES_EDIT_FAILED", details: e.message });
    }
}

module.exports = { editSubSeriesInSeries };
