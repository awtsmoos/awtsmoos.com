//B"H
//Blessed is He
//Boruch Hashem
/**
 * Verbatim property-map builder block of getPostsOfAliasInSeries (relocated from post/index.js).
 */

function buildPostPropertyMap({ aliasId, allPostIDs }) {
		var mapObj = {};
		for(var p of allPostIDs) {
			mapObj[p] = {
				title: true,
				author: {
					equals: aliasId
				},
				createdAt: true,
				id: true,
				parentSeriesId: true
				
			}
		}
		return mapObj;
	}

module.exports = { buildPostPropertyMap };
