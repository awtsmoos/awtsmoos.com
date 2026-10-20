//B"H
//Blessed is He
//Boruch Hashem
/**
 * Alias comment/created-series path getters (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { get } = require("./indexCore.js");

async function getPostsOfCommentsInSeriesOfAlias({
	$i,
	aliasId,
	heichelId,
	//seriesId,
	crumbpath
}) {
	
	
	var pth = `${sp}/aliases/${
		aliasId	
	}/commets/heichel/${
		heichelId	
	}/series/${
		seriesId
	}/atPost`
	return await get(pth, $i)	
}

async function getSeriesInHeichelOfCommetsOfAlias({
	$i,
	aliasId,
	heichelId
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/commets/heichel/${
		heichelId	
	}/series/`
	return await get(pth, $i)	
}

async function getHeichelosOfCommetsOfAlias({
	$i,
	aliasId
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/commets/heichel`
	return await get(pth, $i)	
}

async function getHeichelosOfSeriesCreatedOfAlias({$i, aliasId}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/seriesCreated/inHeichel`
	return await get(pth, $i)
}

async function getSeriesCreatedOfAliasInHeichel({
	$i, 
	aliasId,
	heichelId
}) {
	var pth = `${sp}/aliases/${
		aliasId	
	}/seriesCreated/inHeichel/${
		heichelId
	}`
	return await get(pth, $i)
}

module.exports = {
	getPostsOfCommentsInSeriesOfAlias,
	getSeriesInHeichelOfCommetsOfAlias,
	getHeichelosOfCommetsOfAlias,
	getHeichelosOfSeriesCreatedOfAlias,
	getSeriesCreatedOfAliasInHeichel,
};
