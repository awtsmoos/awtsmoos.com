// B"H
/**
 * @module ProfileHeichelos
 * @description
 * Chapter 96: The profile must remember the old kingdom too.
 *
 * Older Geelooy stored an alias' world in several places: created Heichelos,
 * legacy Heichel maps, posts-submitted indexes, and global Heichel maps when
 * available. This module gathers them all so @rambam and ancient aliases do not
 * look empty merely because the new profile API expected only the newest index.
 */

const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");
const { memoizedRead } = require("./readCache.js");

function mergeIds(...groups) {
    return [...new Set(groups.flat().filter(Boolean).map(String))];
}

async function aliasIndexedHeichelIds($i, aliasId) {
    const created = idList(await read($i, paths.aliasHeichelos(aliasId), {}));
    const legacy = idList(await read($i, `/social/aliases/${aliasId}/heichelos`, {}));
    const contributed = idList(await read($i, `/social/aliases/${aliasId}/heichelosContributedTo`, {}));
    const submitted = idList(await read($i, `/social/aliases/${aliasId}/postsSubmitted/inHeichel`, {}));
    return mergeIds(created, legacy, contributed, submitted);
}

async function globalHeichelIds($i) {
    return idList(await read($i, paths.heichelRoot(), {}));
}

async function heichelRole($i, aliasId, heichelId, indexedIds) {
    const info = await read($i, paths.heichelInfo(heichelId), {});
    if (info.author === aliasId) return "owner";
    const editors = await read($i, `/social/heichelos/${heichelId}/editors`, []);
    if (Array.isArray(editors) && editors.includes(aliasId)) return "editor";
    if (indexedIds.includes(heichelId)) return "contributor";
    return "observer";
}

async function computeRelevantHeichelIds($i, aliasId) {
    const indexed = await aliasIndexedHeichelIds($i, aliasId);
    const global = await globalHeichelIds($i);
    const ownedFromGlobal = [];
    for (const heichelId of global) {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        if (info.author === aliasId) ownedFromGlobal.push(heichelId);
    }
    return mergeIds(indexed, ownedFromGlobal);
}

// B"H 2026-11-20 (profile data-layer fix): the global ownership scan
// reads every heichel's info record, and it was re-run independently
// by the comments, heichelos and tree sections of a single profile
// request (and again by the posts rescue scan). Memoized for the
// profile read TTL — see readCache.js.
async function relevantHeichelIds($i, aliasId) {
    return memoizedRead("heichelIds:" + aliasId, () => computeRelevantHeichelIds($i, aliasId));
}

async function ownedHeichelIds($i, aliasId) {
    return await relevantHeichelIds($i, aliasId);
}

async function computeProfileHeichelos($i, aliasId) {
    const indexed = await aliasIndexedHeichelIds($i, aliasId);
    const items = [];
    for (const heichelId of await relevantHeichelIds($i, aliasId)) {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        items.push({
            id: heichelId,
            name: cleanText(info.name || heichelId, 90),
            description: cleanText(info.description || "", 280),
            role: await heichelRole($i, aliasId, heichelId, indexed)
        });
    }
    return items;
}

// B"H 2026-11-20 (profile data-layer fix): memoized per alias — see
// readCache.js. The per-heichel info/role reads inside are paid once
// per TTL window instead of once per profile request.
async function profileHeichelos($i, aliasId) {
    return memoizedRead("heichelos:" + aliasId, () => computeProfileHeichelos($i, aliasId));
}

module.exports = { ownedHeichelIds, profileHeichelos, aliasIndexedHeichelIds, relevantHeichelIds };
