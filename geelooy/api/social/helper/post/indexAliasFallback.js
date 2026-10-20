//B"H
//Blessed is He
//Boruch Hashem
/**
 * Verbatim empty-series branch of getPostsOfAliasInSeries (relocated from post/index.js).
 */
const { er } = require("../general.js");
const { mapSeriesIDsToSeries } = require("./indexAliasPosts.js");

async function resolveSeriesInPath({ $i, heichelId, p }) {
			var ser = await mapSeriesIDsToSeries({
						$i,
						seriesIDs: p,
						heichelId
					});
			if(ser.error) {
				return ser;
			}
			if(Array.isArray(ser.success)) {
				ser = ser.success;
			} else {
				return er({
					message: "Something went wrong. "
					+"Series not in right format",
					details: ser,
					code: "WRONG_FORMAT"
				})
			}
			return {
				seriesInPath: ser
					
			}
}

module.exports = { resolveSeriesInPath };
