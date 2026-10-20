//B"H
//Blessed is He
//Boruch Hashem
/**
 * Listing all series in a heichel (relocated verbatim from series.js).
 */
const { sp } = require("./_awtsmoos.constants.js");
const { getSeries } = require("./seriesRead.js");



// --- Functions to keep or adapt from original, if still needed ---

/**
 * @description Gets all series IDs in a Heichel. Relies on DB structure.
 * May need optimization (e.g., dedicated index) for large Heichels.
 * (Keeping original logic for now, assuming `$i.db.get` on the base path works)
 */
async function getAllSeriesInHeichel({ $i, heichelId, withDetails = false }) {
	try {
		var ids = await $i.db.get(sp + `/heichelos/${heichelId}/series/`); // Assumes this lists all series IDs
		if (!ids || !Array.isArray(ids)) { // Adapt based on actual return type
		     console.warn(`getAllSeriesInHeichel: Could not list series IDs for ${heichelId}. Assuming empty.`);
		     ids = [];
		     // Alternatively, implement traversal from root if listing isn't supported.
		 }


		if (!withDetails) return ids;

        // Fetch details concurrently
        const detailsPromises = ids.map(id =>
            getSeries({ $i, heichelId, seriesId: id, withDetails: false }) // Get prateem only
            .then(result => result && !result.error ? result.prateem : {id, error: "Not found or error"})
        );
        const results = await Promise.all(detailsPromises);
        return results.filter(Boolean); // Filter out potential nulls/errors if needed

	} catch (e) {
        console.error(`Error in getAllSeriesInHeichel for ${heichelId}: ${e}`);
		return []; // Return empty on error
	}
}

module.exports = { getAllSeriesInHeichel };
