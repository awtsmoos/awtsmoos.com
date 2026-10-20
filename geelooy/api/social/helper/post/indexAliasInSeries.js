//B"H
//Blessed is He
//Boruch Hashem
/**
 * Posts-of-alias-in-series entry point (relocated from post/index.js; collection lives in indexAliasCollect.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { er } = require("../general.js");
const { get } = require("./indexCore.js");
const { collectAliasPosts } = require("./indexAliasCollect.js");

/*return er({
			message: "Missing path to series",
			code: "NO_SERIES_PATH"
		});*/
async function getPostsOfAliasInSeries({
	$i, aliasId,
	heichelId,
	seriesId,
	crumbpath,
	withDetails= false
}) {
	
	var mp = `${sp}/aliases/${
			aliasId	
		}/postsSubmitted/inHeichel/${
			heichelId	
		}/seriesChain/`;
	if(
		typeof(crumbpath) != "string" ||
		crumbpath.length == 0
	) {
		var g = await get(mp, $i)
		return g;
	}
	var crumbled = mp + crumbpath;
	
	var splat = crumbpath.split("/")
	var seriesId = splat[
		splat.length-1
	];

	/*
	return {
		seriesId
	// }*
	/*var pth = `${sp}/aliases/${
		aliasId	
	}/postsSubmitted/inHeichel/${
		heichelId
	}/inSeries/${
		seriesId
	}`*/
	var p = await get(crumbled, $i, false);
	if(p.error) {
		return er(p.error)
	}
	if(p.success) {
		p = p.success
	}
	
	//if(!withDetails) return k
	return await collectAliasPosts({
		$i, aliasId, heichelId, seriesId, p
	});
}

module.exports = { getPostsOfAliasInSeries };
