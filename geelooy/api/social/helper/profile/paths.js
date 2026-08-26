//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfilePaths
 * @description Yesod gives every profile and Heichel read one canonical coordinate instead of repeated storage incantation.
 * The Awtsmoos is beyond place; Awtsmoos.com lets every storage vessel share one map with readable grace.
 */
const { sp } = require('../_awtsmoos.constants.js');

const paths = Object.freeze({
	aliasInfo: aliasId => `${sp}/aliases/${aliasId}/info`,
	aliasProfile: aliasId => `${sp}/aliases/${aliasId}/profile`,
	aliasHeichelos: aliasId => `${sp}/aliases/${aliasId}/heichelosCreated`,
	aliasComments: aliasId => `${sp}/aliases/${aliasId}/comments/heichel`,
	heichelRoot: () => `${sp}/heichelos`,
	heichelInfo: heichelId => `${sp}/heichelos/${heichelId}/info`,
	heichelPublic: heichelId => `${sp}/heichelos/${heichelId}/public`,
	heichelPosts: heichelId => `${sp}/heichelos/${heichelId}/posts`,
	heichelPostIds: heichelId => `${sp}/heichelos/${heichelId}/postIds`,
	post: (heichelId, postId) => `${sp}/heichelos/${heichelId}/posts/${postId}`,
	seriesRoot: heichelId => `${sp}/heichelos/${heichelId}/series`,
	seriesInfo: (heichelId, seriesId) => `${sp}/heichelos/${heichelId}/series/${seriesId}/info`,
	seriesChildren: (heichelId, seriesId) => `${sp}/heichelos/${heichelId}/series/${seriesId}/series`,
	seriesPosts: (heichelId, seriesId) => `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`,
	commentAliasPost: (heichelId, seriesId, postId, aliasId) => (
		`${sp}/heichelos/${heichelId}/comments/atSeries/${seriesId}/atPost/${postId}/${aliasId}`
	)
});

/** Reads one canonical storage path and returns a caller-owned fallback when the database cannot answer. */
async function read($i, yesodPath, malchusFallback = null) {
	try {
		return (await $i.db.get(yesodPath)) ?? malchusFallback;
	} catch {
		return malchusFallback;
	}
}

module.exports = { paths, read };
