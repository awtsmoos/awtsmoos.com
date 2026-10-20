//B"H
//Blessed is He
//Boruch Hashem
/**
 * Root-series bootstrap and descendant scan (relocated verbatim from series.js).
 */
const { sp } = require("./_awtsmoos.constants.js");
const { seriesPrateemPath, seriesSubSeriesPath, seriesPostsPath } = require("./seriesPaths.js");

/**
 * @description Ensures the 'root' series structure exists within a Heichel. Creates it if not found.
 * Internal helper function.
 */
async function ensureRootSeriesExists({ $i, heichelId }) {
    const rootPrateemPath = seriesPrateemPath(heichelId, "root");
    try {
        // Check if root prateem already exists
        const rootExists = await $i.db.get(rootPrateemPath, { propertyMap: { id: true } });
        if (rootExists) {
            return { success: true, existed: true }; // Root already exists
        }
    } catch (e) {
        // If error is "Path does not exist", we need to create it.
        // If it's another error, rethrow it.
        if (!e.message?.includes("Path does not exist") && e.code !== 'PATH_NOT_FOUND' /* Adapt based on db error codes */) {
            console.error(`Error checking for root series existence in ${heichelId}:`, e);
            throw new Error(`Failed to check root series existence: ${e.message}`);
        }
        // Path doesn't exist, proceed to create below.
    }

    // Root doesn't exist, create it
    try {
        const rootPrateem = {
            id: "root",
            name: "Root",
            description: "The base series of the Heichel.",
            author: "system", // Or null, or the Heichel creator? 'system' seems reasonable.
            parentSeriesId: null, // Root has no parent
            createdAt: Date.now(),
            isRoot: true
        };
        await $i.db.write(rootPrateemPath, rootPrateem);
        await $i.db.write(seriesSubSeriesPath(heichelId, "root"), []); // Initialize subSeries
        await $i.db.write(seriesPostsPath(heichelId, "root"), {});   // Initialize posts

        return { success: true, created: true };
    } catch (eCreate) {
        console.error(`Failed to create 'root' series structure for Heichel ${heichelId}:`, eCreate);
        throw new Error(`Failed to create root series: ${eCreate.message}`);
    }
}

// 

/**
 * @description Recursively finds all descendant series IDs for a given series.
 * @returns {Promise<Array<string>>} A flat array of all series IDs to be deleted.
 */
async function getAllDescendantIds({ $i, heichelId, seriesId }) {
    const idsToDelete = new Set();
    const seriesProcessed = new Set(); // For cycle detection

    const seriesSubSeriesPath = (h, s) => `${sp}/heichelos/${h}/series/${s}/subSeries`;

    async function recursiveScan(currentSeriesId) {
        if (seriesProcessed.has(currentSeriesId)) return;
        seriesProcessed.add(currentSeriesId);

        idsToDelete.add(currentSeriesId); // Add the current series to the list

        const subSeriesPath = seriesSubSeriesPath(heichelId, currentSeriesId);
        try {
            const subSeriesIds = await $i.db.get(subSeriesPath);
            if (Array.isArray(subSeriesIds)) {
                for (const subId of subSeriesIds) {
                    await recursiveScan(subId); // Recurse into children
                }
            }
        } catch (e) {
            // This is not an error, it just means the series has no children.
            if (!e.message.includes("Path does not exist")) {
                console.error(`Error scanning sub-series for ${currentSeriesId}:`, e);
            }
        }
    }

    await recursiveScan(seriesId);
    return Array.from(idsToDelete);
}

module.exports = {
	ensureRootSeriesExists,
	getAllDescendantIds,
};
