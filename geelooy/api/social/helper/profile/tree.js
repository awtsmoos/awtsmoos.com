// B"H
/**
 * @module ProfileTree
 * @description
 * Chapter 56: The Awtsmoos reveals the tree: Heichel, series, subseries,
 * posts, and section counts, a clean navigation spine for mobile souls.
 */

const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");
const { ownedHeichelIds } = require("./heichelos.js");
const { postIds } = require("./posts.js");

async function seriesNode($i, heichelId, seriesId, depth = 0) {
    const info = await read($i, paths.seriesInfo(heichelId, seriesId), {});
    const childIds = idList(await read($i, paths.seriesChildren(heichelId, seriesId), {}));
    const children = [];
    if (depth < 4) {
        for (const childId of childIds) children.push(await seriesNode($i, heichelId, childId, depth + 1));
    }
    return {
        id: seriesId,
        seriesId,
        title: cleanText(info.name || info.title || seriesId, 100),
        postsCount: idList(await read($i, paths.seriesPosts(heichelId, seriesId), {})).length,
        children
    };
}

async function treeByAlias({ $i, aliasId }) {
    const tree = [];
    for (const heichelId of await ownedHeichelIds($i, aliasId)) {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        const children = [];
        for (const seriesId of idList(await read($i, paths.seriesRoot(heichelId), {}))) {
            children.push(await seriesNode($i, heichelId, seriesId));
        }
        tree.push({ heichelId, heichelName: cleanText(info.name || heichelId, 100), postsCount: (await postIds($i, heichelId)).length, children });
    }
    return tree;
}

module.exports = { treeByAlias, seriesNode };
