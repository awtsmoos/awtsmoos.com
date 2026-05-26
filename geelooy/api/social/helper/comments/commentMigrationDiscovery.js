// B"H
/**
 * @file commentMigrationDiscovery.js
 * @description
 * The old forest has two paths: comments on posts, and comments on comments.
 * This module walks those branches gently, asking DosDB for every doorway
 * before the packed shard migration gathers the sparks into one ledger.
 */

const { getPathAtSeries } = require("./commentPaths.js");

/**
 * Converts a DosDB directory response into an array of names.
 * @param {*} value DosDB get response.
 * @returns {Array<string>} Directory names.
 */
function namesFromDirectory(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
    return [];
}

/**
 * Reads a directory without letting absent paths abort discovery.
 * @param {object} db DosDB-like database.
 * @param {string} path Logical DB path.
 * @returns {Promise<Array<string>>} Directory entry names.
 */
async function readNames(db, path) {
    try {
        return namesFromDirectory(await db.get(path));
    } catch (_) {
        return [];
    }
}

/**
 * Discovers comment parents under one heichel/series pair.
 * @param {object} params Discovery params.
 * @param {object} params.$i Runtime context.
 * @param {string} params.heichelId Heichel id.
 * @param {string} params.seriesId Series id.
 * @returns {Promise<Array<object>>} Parent migration contexts.
 */
async function discoverCommentParentsForSeries({ $i, heichelId, seriesId }) {
    const db = $i?.db;
    if (!db) return [];
    const seriesBase = getPathAtSeries({ heichelId, seriesId });
    const postBase = `${seriesBase}/atPost`;
    const postIds = await readNames(db, postBase);
    const parents = postIds.map(postId => ({
        heichelId,
        seriesId,
        parentType: "post",
        parentId: postId,
        postId
    }));

    for (const postId of postIds) {
        const commentBase = `${postBase}/${postId}/atComment`;
        const commentIds = await readNames(db, commentBase);
        for (const commentId of commentIds) {
            parents.push({
                heichelId,
                seriesId,
                parentType: "comment",
                parentId: commentId,
                postId
            });
        }
    }
    return parents;
}

/**
 * Discovers comment parents for one heichel, optionally constrained to a series.
 * @param {object} params Discovery params.
 * @returns {Promise<Array<object>>} Parent migration contexts.
 */
async function discoverCommentParents({ $i, heichelId, seriesId }) {
    const db = $i?.db;
    if (!db || !heichelId) return [];
    const seriesIds = seriesId
        ? [seriesId]
        : await readNames(db, `/social/heichelos/${heichelId}/comments/atSeries`);
    const all = [];
    for (const id of seriesIds) {
        all.push(...await discoverCommentParentsForSeries({ $i, heichelId, seriesId: id }));
    }
    return all;
}

module.exports = {
    namesFromDirectory,
    readNames,
    discoverCommentParentsForSeries,
    discoverCommentParents
};
