// B"H
/**
 * @module ProfilePaths
 * @description
 * Chapter 50: The Awtsmoos draws the profile map so every module walks the
 * same paths and no duplicate spell of storage appears in the codebase.
 */

const { sp } = require("../_awtsmoos.constants.js");

const paths = {
    aliasInfo: aliasId => `${sp}/aliases/${aliasId}/info`,
    aliasProfile: aliasId => `${sp}/aliases/${aliasId}/profile`,
    aliasHeichelos: aliasId => `${sp}/aliases/${aliasId}/heichelosCreated`,
    aliasComments: aliasId => `${sp}/aliases/${aliasId}/comments/heichel`,
    heichelRoot: () => `${sp}/heichelos`,
    heichelInfo: heichelId => `${sp}/heichelos/${heichelId}/info`,
    heichelPosts: heichelId => `${sp}/heichelos/${heichelId}/posts`,
    heichelPostIds: heichelId => `${sp}/heichelos/${heichelId}/postIds`,
    post: (heichelId, postId) => `${sp}/heichelos/${heichelId}/posts/${postId}`,
    seriesRoot: heichelId => `${sp}/heichelos/${heichelId}/series`,
    seriesInfo: (heichelId, seriesId) => `${sp}/heichelos/${heichelId}/series/${seriesId}/info`,
    seriesChildren: (heichelId, seriesId) => `${sp}/heichelos/${heichelId}/series/${seriesId}/series`,
    seriesPosts: (heichelId, seriesId) => `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`,
    commentAliasPost: (heichelId, seriesId, postId, aliasId) => `${sp}/heichelos/${heichelId}/comments/atSeries/${seriesId}/atPost/${postId}/${aliasId}`
};

async function read($i, path, fallback = null) {
    try { return (await $i.db.get(path)) ?? fallback; } catch { return fallback; }
}

module.exports = { paths, read };
