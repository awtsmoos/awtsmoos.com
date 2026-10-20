//B"H
//Blessed is He
//Boruch Hashem
/**
 * Sub-series list append helper (relocated verbatim from series.js).
 */
const { er } = require("./general.js");
const { seriesSubSeriesPath } = require("./seriesPaths.js");

/**
 * @description Helper to add a child series ID to a parent's subSeries array.
 * Internal use by makeNewSeries and potentially move operations.
 * Assumes parent series structure exists (checked by caller like makeNewSeries).
 */
async function addSubSeriesToParent({ $i, heichelId, parentSeriesId, childSeriesId }) {
    const parentSubSeriesPath = seriesSubSeriesPath(heichelId, parentSeriesId);
    try {
        let subSeries;
        try {
            subSeries = await $i.db.get(parentSubSeriesPath);
        } catch (eGet) {
            // If parent path *still* doesn't exist here, something is wrong upstream
            // or it's a race condition. Try initializing.
             if (eGet.message?.includes("Path does not exist") || eGet.code === 'PATH_NOT_FOUND') {
                 console.warn(`Parent series ${parentSeriesId} subSeries path not found in addSubSeriesToParent. Initializing. Caller should have ensured existence.`);
                 subSeries = [];
             } else {
                 throw eGet; // Rethrow other DB errors
             }
         }

        if (!Array.isArray(subSeries)) {
            // Path existed but wasn't an array? Problematic. Log and overwrite.
            console.error(`Data Corruption: Parent series ${parentSeriesId} subSeries path was not an array. Overwriting.`);
            subSeries = [];
        }

        subSeries = appendAndDeduplicateString(subSeries,childSeriesId) 
     
        const writeResult = await $i.db.write(parentSubSeriesPath, subSeries);
        if (writeResult?.error) {
             throw new Error(`DB write error: ${writeResult.error.message || writeResult.error}`);
         }
        
        return { success: true };
    } catch (e) {
        console.error(`Failed to add ${childSeriesId} to parent ${parentSeriesId}:`, e);
        return er({ code: "ADD_TO_PARENT_FAILED", details: e.message });
    }
}

/**
 * Appends a string to an array and removes all duplicate instances of that string,
 * ensuring only one instance remains (the one that was just added, or the first one found).
 *
 * @param {Array<string>} arr - The array to modify.
 * @param {string} newString - The string to append and de-duplicate.
 * @returns {Array<string>} The modified array with only one instance of newString.
 */
function appendAndDeduplicateString(arr, newString) {
    // 1. Append the new string to the array
    arr.push(newString);

    // 2. Use a Set to filter out duplicates while preserving insertion order (for modern JS environments)
    // Note: This removes *all* duplicates of newString, not just the new one.
    const uniqueElements = new Set(arr);

    // 3. Convert the Set back to an Array
    const newArr = Array.from(uniqueElements);

    // Optional: If you specifically want the *new* one to be the *last* element,
    // you'd need a slightly more complex filter:
    /*
    const filteredArr = [];
    let foundNewString = false;
    for (const item of arr) {
        if (item === newString) {
            if (!foundNewString) {
                filteredArr.push(item);
                foundNewString = true;
            }
        } else {
            filteredArr.push(item);
        }
    }
    return filteredArr;
    */

    return newArr;
}

module.exports = {
	addSubSeriesToParent,
	appendAndDeduplicateString,
};
