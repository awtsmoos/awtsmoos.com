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

async function relevantHeichelIds($i, aliasId) {
    const indexed = await aliasIndexedHeichelIds($i, aliasId);
    const global = await globalHeichelIds($i);
    const ownedFromGlobal = [];
    for (const heichelId of global) {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        if (info.author === aliasId) ownedFromGlobal.push(heichelId);
    }
    return mergeIds(indexed, ownedFromGlobal);
}

async function ownedHeichelIds($i, aliasId) {
    return await relevantHeichelIds($i, aliasId);
}

async function profileHeichelos($i, aliasId) {
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

module.exports = { ownedHeichelIds, profileHeichelos, aliasIndexedHeichelIds, relevantHeichelIds };
