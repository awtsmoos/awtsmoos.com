// B"H
/**
 * @module ProfileHeichelos
 * @description
 * Chapter 53: The Awtsmoos gathers every palace owned by the alias, whether
 * indexed by old lists or discovered through the global Heichel sea.
 */

const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");

async function ownedHeichelIds($i, aliasId) {
    const created = idList(await read($i, paths.aliasHeichelos(aliasId), {}));
    const global = idList(await read($i, paths.heichelRoot(), {}));
    const all = [...new Set([...created, ...global])];
    const owned = [];
    for (const heichelId of all) {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        if (created.includes(heichelId) || info.author === aliasId) owned.push(heichelId);
    }
    return [...new Set(owned)];
}

async function profileHeichelos($i, aliasId) {
    const items = [];
    for (const heichelId of await ownedHeichelIds($i, aliasId)) {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        items.push({ id: heichelId, name: cleanText(info.name || heichelId, 90), description: cleanText(info.description, 280), role: "owner" });
    }
    return items;
}

module.exports = { ownedHeichelIds, profileHeichelos };
