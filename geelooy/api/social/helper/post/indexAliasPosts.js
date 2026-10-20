//B"H
//Blessed is He
//Boruch Hashem
/**
 * Alias submitted-post heichel listing and series mapping (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { get, dirKeys } = require("./indexCore.js");

async function getHeichelosOfPostsOfAlias({
	$i, aliasId,
	withDetails = true
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/postsSubmitted/inHeichel`
	var g = await get(pth, $i);
	if(g.error) return g;
	g = g.success;
	if(!withDetails)
		return g;
	// B"H 2026-10-12 (FRONT-1 api-audit): directory listings are objects,
	// not arrays — normalize via dirKeys or every alias resolves empty.
	g = await dirKeys($i, pth, g);
	
	var heichelos = [];
	var hei;
	for(
		hei of g
	) {
		var det = await $i.db.get(
			`${sp}/heichelos/${
				hei
			}/info`, {
				propertyMap: {
					author: true,
					name: true
				}
			}
		);
		if(det) {
			det.id = hei;
			heichelos.push(det)
		} else {
			// B"H 2026-10-12 (FRONT-1 api-audit): import-created heichels
			// carry posts but no /info record — still list the id so the
			// alias->post link resolves instead of vanishing.
			heichelos.push({id: hei});
		}
	}

	return {success: heichelos};
}

async function mapSeriesIDsToSeries({
	$i,
	seriesIDs,
	heichelId
}) {
	// B"H 2026-10-12 (FRONT-1 api-audit): tolerate object-shaped listings.
	if(!Array.isArray(seriesIDs)) {
		seriesIDs = (seriesIDs && typeof seriesIDs === 'object') ? Object.keys(seriesIDs) : [];
	}
	var res = []
	var ser;
	for(ser of seriesIDs) {
		var det = await $i.db.get(
			`${sp}/heichelos/${
				heichelId
			}/series/${
				ser
			}/prateem`, {
				propertyMap: {
					author: true,
					name: true,
					id: true,
					createdAt: true,
					parentSeriesId: true
				}
			}
		);
		if(det)
			res.push(det)
	}
	return {success: res};
}

module.exports = {
	getHeichelosOfPostsOfAlias,
	mapSeriesIDsToSeries,
};
