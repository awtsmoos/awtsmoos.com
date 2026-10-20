//B"H
//Blessed is He
//Boruch Hashem
/**
 * Sub-series listing and property filtering (relocated verbatim from series.js).
 */
const { er } = require("./general.js");
const { seriesPrateemPath, seriesSubSeriesPath } = require("./seriesPaths.js");

/**
 * @description Gets the IDs of sub-series within a parent series.
 * @param withDetails If true, fetches full prateem for each sub-series.
 */
async function getSubSeries({ $i, heichelId, parentSeriesId, withDetails = true }) {
    const subSeriesP = seriesSubSeriesPath(heichelId, parentSeriesId);

    try {
        let subSeriesIds = await $i.db.get(subSeriesP);
        if (!Array.isArray(subSeriesIds)) {
            return []; // Return empty array if no subseries or path invalid
        }

		

        if (!withDetails) {
            return subSeriesIds;
        } else {
            // Fetch details for each sub-series ID
            const detailedSeries = [];
            for (const seriesId of subSeriesIds) {
	        var serPath = seriesPrateemPath(heichelId, seriesId)
                const seriesData = await $i.db.get(serPath)
                
                if (seriesData && !seriesData.error && !Buffer.isBuffer(seriesData)) {
                    detailedSeries.push(seriesData);
                } else {
                  //  console.warn(`Could not fetch details for sub-series ${seriesId} in ${parentSeriesId}`);
                    // Optionally include a placeholder or skip
                   detailedSeries.push({ id: seriesId, error: "Details not found" });
                }
            }
            return detailedSeries;
        }

    } catch (e) {
        if (e.message.includes("Path does not exist")) {
            return []; // Parent series might not exist or have subSeries
        }
        console.error(`Error getting subSeries for ${parentSeriesId}:`, e);
        return er({ code: "SUB_SERIES_GET_FAILED", details: e.message });
    }
}

/**
 * @description Filters sub-series based on a property in their prateem.
 * (Logic largely unchanged, operates on array fetched by getSubSeries)
 */
async function getSeriesByProperty({ $i, heichelId, parentSeriesId, propertyKey, propertyValue }) {
	if (!propertyKey && propertyKey !== 0) {
		return er({ message: "Property key needed", code: "PROP_KEY_NEEDED" });
	}

	try {
		// Get IDs first
		const subSeriesIds = await getSubSeries({ $i, heichelId, parentSeriesId, withDetails: false });
		if (subSeriesIds?.error || subSeriesIds.length === 0) {
			return [];
		}

		const filteredIds = [];
		for (const seriesId of subSeriesIds) {
			try {
			    const prateem = await $i.db.get(seriesPrateemPath(heichelId, seriesId), {
				    propertyMap: { [propertyKey]: true } // Fetch only the needed property
			    });
			    if (prateem && prateem[propertyKey] == propertyValue) {
				    filteredIds.push(seriesId);
			    }
            } catch (eGet) {
                // Ignore series if prateem fetch fails
                console.warn(`Could not check property for sub-series ${seriesId}: ${eGet.message}`);
            }
		}
		return filteredIds;

	} catch (e) {
		console.error("Error in getSeriesByProperty:", e);
		return er({ message: "Failed to filter series by property", code: "SERIES_FILTER_FAILED", details: e.message });
	}
}

module.exports = {
	getSubSeries,
	getSeriesByProperty,
};
