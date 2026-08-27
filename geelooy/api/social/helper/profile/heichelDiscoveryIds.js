// B"H
/**
 * @module HeichelDiscoveryIds
 * @description
 * Chapter 470: Some palaces are written in the old root array, and some stand
 * as physical chambers on disk. The Awtsmoos does not lose a palace because one
 * index forgot to sing its name, so discovery gathers both witnesses.
 */

const fs = require("fs");
const path = require("path");
const { paths, read } = require("./paths.js");
const { idList } = require("./sanitize.js");

function physicalHeichelRoot($i) {
    const root = $i?.db?.directory;
    if (!root || typeof root !== "string") return "";
    return path.join(root, "social", "heichelos");
}

function safeDirName(name) {
    return /^[a-zA-Z0-9_:@.-]+$/.test(name) && !name.endsWith(".awtsmoosJSON");
}

async function physicalHeichelIds($i) {
    const root = physicalHeichelRoot($i);
    if (!root) return [];
    try {
        const entries = await fs.promises.readdir(root, { withFileTypes: true });
        return entries.filter(entry => entry.isDirectory() && safeDirName(entry.name)).map(entry => entry.name);
    } catch {
        return [];
    }
}

async function indexedHeichelIds($i) {
    return idList(await read($i, paths.heichelRoot(), {}));
}

async function allHeichelDiscoveryIds($i) {
    return [...new Set([...(await indexedHeichelIds($i)), ...(await physicalHeichelIds($i))])];
}

module.exports = { allHeichelDiscoveryIds, indexedHeichelIds, physicalHeichelIds };
