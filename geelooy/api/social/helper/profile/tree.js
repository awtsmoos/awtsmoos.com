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
const { memoizedRead } = require("./readCache.js");

async function seriesNode($i, heichelId, seriesId, depth = 0) {
    const info = await read($i, paths.seriesInfo(heichelId, seriesId), {});
    const childIds = idList(await read($i, paths.seriesChildren(heichelId, seriesId), {}));
    const children = depth < 4
        ? await Promise.all(childIds.map(childId => seriesNode($i, heichelId, childId, depth + 1)))
        : [];
    return {
        id: seriesId,
        seriesId,
        title: cleanText(info.name || info.title || seriesId, 100),
        postsCount: idList(await read($i, paths.seriesPosts(heichelId, seriesId), {})).length,
        children
    };
}

async function computeTreeByAlias({ $i, aliasId }) {
    return Promise.all((await ownedHeichelIds($i, aliasId)).map(async heichelId => {
        const info = await read($i, paths.heichelInfo(heichelId), {});
        const rootIds = idList(await read($i, paths.seriesRoot(heichelId), {}));
        const [children, allPostIds] = await Promise.all([
            Promise.all(rootIds.map(seriesId => seriesNode($i, heichelId, seriesId))),
            postIds($i, heichelId)
        ]);
        return { heichelId, heichelName: cleanText(info.name || heichelId, 100), postsCount: allPostIds.length, children };
    }));
}

// B"H 2026-11-20 (profile data-layer fix): the tree walk is the
// single most expensive profile section — 3 store reads per series
// node across every owned heichel (measured 55.6s cold under load,
// 2.6s on a calm box, for one alias). Memoized per alias — see
// readCache.js.
async function treeByAlias({ $i, aliasId }) {
    return memoizedRead("tree:" + aliasId, () => computeTreeByAlias({ $i, aliasId }));
}

module.exports = { treeByAlias, seriesNode };
