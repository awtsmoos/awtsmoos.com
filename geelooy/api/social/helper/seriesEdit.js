//B"H
//Blessed is He
//Boruch Hashem
/**
 * Series details editing (relocated verbatim from series.js).
 */
const { er, loggedIn } = require("./general.js");
const { verifyHeichelAuthority } = require("./heichel.js");
const { seriesPrateemPath } = require("./seriesPaths.js");

/**
 * @description Edits the details (prateem) of an existing series.
 * @requires $_PUT: { aliasId, description?, seriesName/name/title? }
 */
async function editSeriesDetails({ $i, heichelId, seriesId }) {
    if (!loggedIn($i)) return er({ message: "NO_LOGIN" });

    const { aliasId } = $i.$_PUT;
    const newDescription = $i.$_PUT.description;
    const newName = $i.$_PUT.seriesName || $i.$_PUT.name || $i.$_PUT.title;
    // Note: Changing parentSeriesId should be handled by a dedicated "move" function.

    if (!aliasId) return er({ code: "MISSING_PARAMS", details: "Requires aliasId" });

    const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
    if (!isAuthorized) return er({ code: "NO_AUTH" });

    const prateemPath = seriesPrateemPath(heichelId, seriesId);

    try {
        // Fetch existing prateem to update
        const currentPrateem = await $i.db.get(prateemPath);
        if (!currentPrateem) {
            return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId } });
        }

        const updatedPrateem = { ...currentPrateem };
        let changed = false;

        if (newName && typeof newName === "string" && newName.trim().length > 0 && newName.length <= 100) {
            updatedPrateem.name = newName.trim();
            changed = true;
        }
        if (newDescription !== undefined && typeof newDescription === "string" && newDescription.length <= 888) {
             // Allow setting empty description
             updatedPrateem.description = newDescription;
             changed = true;
         }

        if (changed) {
            updatedPrateem.updatedAt = Date.now();
            const writeResult = await $i.db.write(prateemPath, updatedPrateem);
            if (writeResult?.error) {
                throw new Error(`DB write error: ${writeResult.error.message || writeResult.error}`);
            }
        }

        return { success: { message: changed ? "Series updated" : "No changes applied", seriesId } };

    } catch (e) {
        console.error("Error in editSeriesDetails:", e);
        // Check for specific DB errors like not found
        if (e.message.includes("Path does not exist")) {
             return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId } });
        }
        return er({ code: "SERIES_EDIT_FAILED", details: e.message });
    }
}

module.exports = { editSeriesDetails };
