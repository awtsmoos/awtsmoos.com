//B"H
//Blessed is He
//Boruch Hashem
/**
 * Filtering posts in a series by property (relocated verbatim from post/index.js).
 */
const { sp } = require("../_awtsmoos.constants.js");
const { er } = require("../general.js");

/**
 * @description Filters posts within a series by a specific property value.
 * @requires params: heichelId, seriesId, propertyKey, propertyValue
 */
async function getPostsByProperty({ $i, heichelId, seriesId, propertyKey, propertyValue }) {
    if (!propertyKey && propertyKey !== 0) {
        return er({ message: "Property key needed", code: "PROP_KEY_NEEDED" });
    }

    const seriesPostsPath = `${sp}/heichelos/${heichelId}/series/${seriesId}/posts`;

    try {
        // B"H: use cached ID list + narrow reads instead of full object scan
        const { getCachedSeriesIds, setCachedSeriesIds } = require("./seriesReadCache.js");
        let postIds = getCachedSeriesIds(heichelId, seriesId);
        if (!postIds) {
            postIds = await $i.db.getObjectKeys(seriesPostsPath).catch(() => []);
            if (!Array.isArray(postIds)) return [];
            setCachedSeriesIds(heichelId, seriesId, postIds);
        }
        if (!postIds.length) return [];

        // Read posts via narrow child paths and filter
        const filteredPostIds = [];
        const BATCH = 20;
        for (let i = 0; i < postIds.length; i += BATCH) {
            const batch = postIds.slice(i, i + BATCH);
            const reads = await Promise.all(
                batch.map(pid =>
                    $i.db.get(`${seriesPostsPath}/${pid}`, { max: true })
                        .then(d => ({ pid, d }))
                        .catch(() => ({ pid, d: null }))
                )
            );
            for (const { pid, d } of reads) {
                if (d && d[propertyKey] == propertyValue) filteredPostIds.push(pid);
            }
        }

        return filteredPostIds;

    } catch (e) {
         if (e.message.includes("Path does not exist")) {
            return [];
         }
        console.error("Error in getPostsByProperty:", e);
        return er({ message: "Failed to filter posts by property", code: "POST_FILTER_FAILED", details: e.message });
    }
}

module.exports = { getPostsByProperty };
