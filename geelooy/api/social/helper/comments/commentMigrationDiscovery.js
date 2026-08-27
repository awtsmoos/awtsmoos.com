// B"H
/**
 * @file commentMigrationDiscovery.js
 * @chapter The Lantern Walks The Actual Forest
 * @description
 * Discovers legacy comment parents from the real dayuhChadash filesystem when
 * available, because legacy aliases are often files like rashi.awtsmoosJSON.
 * If the filesystem is unavailable, it falls back to DosDB directory reads.
 */

const fs = require("fs");
const path = require("path");
const { getPathAtSeries } = require("./commentPaths.js");

/** @param {*} value @returns {Array<string>} */
function namesFromDirectory(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
    return [];
}

/** @param {string} name @returns {string} */
function stripAwtsmoosJson(name) {
    return String(name || "").replace(/\.awtsmoosJSON$/i, "");
}

/** @param {object} db @param {string} logicalPath @returns {string|null} */
function physicalPath(db, logicalPath) {
    if (!db?.directory) return null;
    return path.join(db.directory, ...String(logicalPath || "").split("/").filter(Boolean));
}

/** @param {string} physical @returns {Array<string>} */
function readPhysicalNames(physical) {
    try {
        return fs.readdirSync(physical, { withFileTypes: true }).map(entry => stripAwtsmoosJson(entry.name)).filter(Boolean);
    } catch (_) {
        return [];
    }
}

/** @param {object} db @param {string} logicalPath @returns {Promise<Array<string>>} */
async function readNames(db, logicalPath) {
    const physical = physicalPath(db, logicalPath);
    const physicalNames = physical ? readPhysicalNames(physical) : [];
    if (physicalNames.length) return physicalNames;
    try { return namesFromDirectory(await db.get(logicalPath)); }
    catch (_) { return []; }
}

/** @param {object} db @param {string} postBase @param {string} postId @returns {Promise<Array<string>>} */
async function discoverReplyParents(db, postBase, postId) {
    const commentBase = `${postBase}/${postId}/atComment`;
    return (await readNames(db, commentBase)).map(commentId => ({ commentId, postId }));
}

/** @param {object} params @returns {Promise<Array<object>>} */
async function discoverCommentParentsForSeries({ $i, heichelId, seriesId }) {
    const db = $i?.db;
    if (!db) return [];
    const seriesBase = getPathAtSeries({ heichelId, seriesId });
    const postBase = `${seriesBase}/atPost`;
    const postIds = await readNames(db, postBase);
    const parents = [];
    for (const postId of postIds) {
        parents.push({ heichelId, seriesId, parentType: "post", parentId: postId, postId });
        for (const reply of await discoverReplyParents(db, postBase, postId)) {
            parents.push({ heichelId, seriesId, parentType: "comment", parentId: reply.commentId, postId: reply.postId });
        }
    }
    return uniqueParents(parents);
}

/** @param {Array<object>} parents @returns {Array<object>} */
function uniqueParents(parents) {
    const seen = new Set();
    return parents.filter(parent => {
        const key = [parent.heichelId, parent.seriesId, parent.parentType, parent.parentId, parent.postId].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/** @param {object} params @returns {Promise<Array<object>>} */
async function discoverCommentParents({ $i, heichelId, seriesId }) {
    const db = $i?.db;
    if (!db || !heichelId) return [];
    const seriesIds = seriesId ? [seriesId] : await readNames(db, `/social/heichelos/${heichelId}/comments/atSeries`);
    const all = [];
    for (const id of seriesIds) all.push(...await discoverCommentParentsForSeries({ $i, heichelId, seriesId: id }));
    return uniqueParents(all);
}

module.exports = { namesFromDirectory, stripAwtsmoosJson, physicalPath, readNames, discoverCommentParentsForSeries, discoverCommentParents };
