//B"H
//Blessed is He
//Boruch Hashem
/**
 * Single-series retrieval (relocated verbatim from series.js).
 */
const { er, myOpts } = require("./general.js");
const { seriesBasePath, seriesPrateemPath, seriesSubSeriesPath, seriesPostsPath } = require("./seriesPaths.js");

/**
 * @description Retrieves series data.
 * @param withDetails If true, includes subSeries IDs and posts (full data).
 * @param properties Optional propertyMap for prateem (ignored if withDetails is false?).
 */
async function getSeries({ 
	$i, heichelId, seriesId, 
	withDetails = false, properties,
	withSubSeriesDetails=false,
	only=null//"posts", "subSeries"
}) {
    // Add view permission checks if needed
    const opts = myOpts($i); // For propertyMap
    const baseP = seriesBasePath(heichelId, seriesId);
    const prateemP = seriesPrateemPath(heichelId, seriesId);
    const subSeriesP = seriesSubSeriesPath(heichelId, seriesId);
    const postsP = seriesPostsPath(heichelId, seriesId);

    try {
        let prateem;
        if (seriesId === "root") {
             // Synthesize root prateem
             prateem = { id: "root", name: "Root", description: "The starting point", isRoot: true };
         } else {
             prateem = await $i.db.get(prateemP, properties ? { propertyMap: properties } : opts);
             if (!prateem) {
                 return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId } });
             }
             // Ensure ID is present
             if (!prateem.id) prateem.id = seriesId;
         }

        const result = { prateem };
		if(withSubSeriesDetails) {
			const subSeriesIds = await $i.db.get(subSeriesP);
		}
        if (withDetails) {
            // Get subSeries IDs (always an array, empty if none)
	        if(!only || only == "subSeries") {
			try {
				
                const subSeriesIds = await $i.db.get(subSeriesP);
				var subSeriesPrateems = [];
				if(Array.isArray(subSeriesIds)) {
					/*for(var subSeriesId of subSeriesIds) {
						var subSeriesPath = seriesPrateemPath(heichelId, subSeriesId);
						var red = await $i.db.get(subSeriesPath);
						subSeriesPrateems.push(red);
					}*/
					result.subSeries = subSeriesIds//subSeriesPrateems;
				} else result.subSeries = [];
            } catch (e) {
                 if (e.message.includes("Path does not exist")) result.subSeries = [];
                 else throw e; // Rethrow other errors
             }
			}

			if(!only || only == "posts") {
             // Get posts (always an object, empty if none)
             try {
                // Get the full post objects directly
                 const postsData = await $i.db.getObjectKeys(postsP);
                 result.posts = (postsData && typeof postsData === 'object') ? postsData : {};
             } catch (e) {
                 if (e.message.includes("Path does not exist")) result.posts = {};
                 else throw e; // Rethrow other errors
             }
			}
        }

        result.id = seriesId;
        return result;

    } catch (e) {
        console.error(`Error getting series ${seriesId}:`, e);
        if (e.message.includes("Path does not exist") || e.code === "SERIES_NOT_FOUND") {
            return er({ code: "SERIES_NOT_FOUND", details: { heichelId, seriesId }, error: e.stack });
        }
        return er({ code: "SERIES_GET_FAILED", details: e.message });
    }
}

module.exports = { getSeries };
