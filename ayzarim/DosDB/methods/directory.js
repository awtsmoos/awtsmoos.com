//B"H
/**
 * directory methods for DosDB class
 *
 * Db-phase2 (audit section 5.3.3): bounded enumeration. The old
 * implementation stat'ed EVERY directory entry before sorting and
 * slicing, so a 10-name page over 5,000 entries paid 5,000 stat calls
 * (~1,174 ms cold for getObjectKeys in the baseline bench). Now:
 *   - sortBy 'alphabetical' orders by NAME (Dirent names are free from
 *     readdir) and stats ONLY the entries on the requested page;
 *   - time-based sorts still need every entry's timestamps, but stats
 *     run in bounded-concurrency chunks (128) instead of one unbounded
 *     Promise.all, and the sort itself is unchanged (stable, same
 *     comparator), so page contents are identical;
 *   - the filterBy branch keeps its historical behavior exactly.
 */
var path = require("path");
var fsSync = require("fs");
const { removeJSONExtension } = require("./path");
var fs = fsSync.promises;

const STAT_CHUNK = 128;

/**
 * Stats entries in bounded-concurrency chunks, preserving order.
 * @param {Array} entries - Dirent-like entries with .name.
 * @param {String} directoryPath - Parent directory path.
 * @returns {Promise<Array>} Entry records { name, created, modified, type }.
 */
async function statEntries(entries, directoryPath) {
    const out = new Array(entries.length);
    for (let start = 0; start < entries.length; start += STAT_CHUNK) {
        const chunk = entries.slice(start, start + STAT_CHUNK);
        const stated = await Promise.all(chunk.map(async (dirent) => {
            var entryPath = path.join(directoryPath, dirent.name);
            var stats = await fs.stat(entryPath);
            return {
                name: dirent.name,
                created: stats.birthtime,
                modified: stats.mtime,
                type: stats?.isDirectory?.() ?
	                "directory" :
	                "file"
            };
        }));
        for (let i = 0; i < stated.length; i++) out[start + i] = stated[i];
    }
    return out;
}

function sortEntries(entries, sortBy, order) {
    // Sort entries based on the sortBy and order parameters
    switch (sortBy) {
    case 'alphabetical':
        entries.sort((a, b) => order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
        break;
    case 'createdBy':
        entries.sort((a, b) => order === 'asc' ? a.created - b.created : b.created - a.created);
        break;
    case 'modifiedBy':
        entries.sort((a, b) => order === 'asc' ? a.modified - b.modified : b.modified - a.modified);
        break;
    }
    return entries;
}

module.exports = {
    /**
     * @method count 
     * @description Counts
     * the number of total
     * entries (files and folders) in
     * path, assuming path is a 
     * directory.
     * 
     * @param {String} rPath 
     */
    async count(rPath) {
        try {
            var stat = await this.stat(rPath, true);
            if(!stat?.isDirectory?.()) {
                return {
                    success: 0
                }
                return {
                    error: {
                        message: "Not a directory",
                        code: "NO_DIR",
                        details: stat
                    }
                }
            }
            var a = await fs.readdir(stat.awtsmoosPath);
            return {
                success: a?.length || 0
            };

        } catch(e) {
            if(e.code = "ENOENT") {
                return {
                    success: 0
                }
            }
            return {
                error: {
                    message: "Couldn't count directory",
                    code: "NO_COUNT"
                }
            }
        }

    },
    async getDirectoryIndecies({
        directoryPath,
        page = 1,
        pageSize = 60,
        filterBy=null,
        sortBy = 'alphabetical',
        order = 'asc',
        keepJSON,
        id,
        db,
        fs
    }={}) {
    try {
        page = parseInt(page);
        pageSize = parseInt(pageSize);
        var startIndex = (page - 1) * pageSize;

        // Retrieve both files and directories
        let entries = await fs.readdir(directoryPath, { withFileTypes: true });
        
        
        if(filterBy  && typeof(filterBy) == "object") {
            try {
                var newEnt = [];
                for(var k of entries) {
                var g = await db.get(id, {
                    propertyMap: filterBy
                });
                if(db.areAllKeysEqual(g,filterBy)) {
                    newEnt.push(g)
                }

                }
                entries = newEnt;
            } catch(e){}
            // Historical path: filterBy results are values, not dirents;
            // keep the original stat-everything behavior for them.
            entries = await statEntries(entries, directoryPath);
            sortEntries(entries, sortBy, order);
            var filteredPage = entries.slice(startIndex, startIndex + pageSize);
            if(!keepJSON) {
                filteredPage = filteredPage.map(q => removeJSONExtension(q))
            }
            return filteredPage;
        }

        if(sortBy === 'alphabetical') {
            // Bounded path: order by name straight from the dirents —
            // no stat is needed to sort — then stat only the page.
            const dirents = entries.slice().sort((a, b) =>
                order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
            const pageDirents = dirents.slice(startIndex, startIndex + pageSize);
            let paginatedNames = await statEntries(pageDirents, directoryPath);
            if(!keepJSON) {
                paginatedNames = paginatedNames.map(q => removeJSONExtension(q))
            }
            return paginatedNames;
        }

        // Time-ordered (or unordered) listings need entry timestamps:
        // stat everything, in bounded chunks, then the original sort.
        entries = await statEntries(entries, directoryPath);
        sortEntries(entries, sortBy, order);

        // Apply pagination to the sorted names
        var paginatedNames = entries.slice(startIndex, startIndex + pageSize);
        if(!keepJSON) {
            paginatedNames = paginatedNames.map(q => removeJSONExtension(q))
        }
        return paginatedNames;
    } catch (error) {
        console.error("Failed to process directory entries", error);
        return [];
    }
    }
}
