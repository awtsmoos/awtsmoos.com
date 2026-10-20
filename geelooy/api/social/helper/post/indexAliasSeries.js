//B"H
//Blessed is He
//Boruch Hashem
/**
 * Series-of-posts lookup for an alias in a heichel (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { get, dirKeys } = require("./indexCore.js");
const { mapSeriesIDsToSeries } = require("./indexAliasPosts.js");

async function getSeriesOfPostsOfAliasInHeichel({
	$i, aliasId,
	heichelId,
	withDetails= true
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/postsSubmitted/inHeichel/${
		heichelId
	}/inSeries`
	var g = await get(pth, $i);
	if(!withDetails) return g;
	if(g.error) return g;
	g = g.success;
	// B"H 2026-10-12 (FRONT-1 api-audit): directory listings are objects,
	// not arrays — normalize via dirKeys or series resolve empty.
	g = await dirKeys($i, pth, g);
	return await mapSeriesIDsToSeries({
		$i,
		seriesIDs: g,
		heichelId
	})
	
}

module.exports = { getSeriesOfPostsOfAliasInHeichel };
