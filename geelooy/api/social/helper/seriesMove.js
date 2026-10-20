//B"H
//Blessed is He
//Boruch Hashem
/**
 * Moving sub-series between parents (relocated verbatim from series.js).
 */
const { er } = require("./general.js");
const { verifyHeichelAuthority } = require("./heichel.js");
const { seriesPrateemPath, seriesSubSeriesPath } = require("./seriesPaths.js");

/**
 * @description Moves one or more sub-series from one parent series to another.
 * @requires $_POST: { aliasId, subSeriesIDs (array), seriesToId (new parent) }
 */
async function changeSubSeriesFromOneSeriesToAnother({ $i, heichelId, seriesFromId, seriesToId }) {
    const { aliasId, subSeriesIDs } = $i.$_POST;

    if (!aliasId || !Array.isArray(subSeriesIDs) || !seriesToId || !seriesFromId) {
        return er({ code: "MISSING_PARAMS", details: "Requires aliasId, subSeriesIDs (array), seriesFromId, seriesToId" });
    }
    if (seriesFromId === seriesToId) return er({ code: "CANNOT_MOVE_TO_SELF" });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    // Check if target series exists (optional but good)
    // ... (add check similar to makeNewSeries parent check)

    const sourcePath = seriesSubSeriesPath(heichelId, seriesFromId);
    const targetPath = seriesSubSeriesPath(heichelId, seriesToId);
    const results = { moved: [], errors: [] };

    try {
        // 1. Remove from source series' subSeries array
        let sourceSubSeries = await $i.db.get(sourcePath);
        if (!Array.isArray(sourceSubSeries)) sourceSubSeries = [];

        const remainingSource = sourceSubSeries.filter(id => !subSeriesIDs.includes(id));
        const actuallyMoved = sourceSubSeries.filter(id => subSeriesIDs.includes(id)); // IDs that were actually in source

        if (actuallyMoved.length > 0) {
            const writeSource = await $i.db.write(sourcePath, remainingSource);
            if (writeSource?.error) throw new Error(`Failed to update source series ${seriesFromId}: ${writeSource.error}`);
        } else {
             console.warn("None of the specified subSeriesIDs were found in the source series.");
             // Proceed to add them to target anyway? Or return error? Let's proceed.
        }


        // 2. Add to target series' subSeries array
        let targetSubSeries = await $i.db.get(targetPath);
        if (!Array.isArray(targetSubSeries)) targetSubSeries = [];

        const toAdd = subSeriesIDs.filter(id => !targetSubSeries.includes(id)); // Add only if not already present
        if (toAdd.length > 0) {
            const newTargetSubSeries = [...targetSubSeries, ...toAdd];
            const writeTarget = await $i.db.write(targetPath, newTargetSubSeries);
            if (writeTarget?.error) throw new Error(`Failed to update target series ${seriesToId}: ${writeTarget.error}`);
        }


        // 3. Update parentSeriesId in the moved series' prateem
        for (const movedId of subSeriesIDs) { // Iterate over requested IDs, not just actuallyMoved
             const movedPrateemPath = seriesPrateemPath(heichelId, movedId);
             try {
                 const prateem = await $i.db.get(movedPrateemPath);
                 if (prateem) {
                     prateem.parentSeriesId = seriesToId;
                     prateem.updatedAt = Date.now();
                     const updatePrateem = await $i.db.write(movedPrateemPath, prateem);
                     if (updatePrateem?.error) {
                          results.errors.push(`Failed to update parentId for ${movedId}: ${updatePrateem.error}`);
                      } else {
                          results.moved.push(movedId);
                      }
                 } else {
                      results.errors.push(`Prateem not found for ${movedId}, cannot update parentId.`);
                  }
             } catch (ePrat) {
                  results.errors.push(`Error updating parentId for ${movedId}: ${ePrat.message}`);
              }
         }

        if (results.errors.length > 0) {
             return er({ code: "SERIES_MOVE_INCOMPLETE", moved: results.moved, errors: results.errors });
         }

        return { success: { message: "Sub-series moved", moved: results.moved, from: seriesFromId, to: seriesToId } };

    } catch (e) {
        console.error("Error moving sub-series:", e);
        return er({ code: "SERIES_MOVE_FAILED", details: e.message, moved: results.moved, errors: results.errors });
    }
}

module.exports = { changeSubSeriesFromOneSeriesToAnother };
