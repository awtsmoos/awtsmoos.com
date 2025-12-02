//B"H
/**
 * directory methods for DosDB class
 */
var path = require("path");
var fsSync = require("fs");
const { removeJSONExtension } = require("./path");
var fs = fsSync.promises;
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
        }
        // Get stats for each entry in parallel
        entries = await Promise.all(entries.map(async (dirent) => {
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

        // Extract just the name for the final result
       /* var sortedNames = entries.map(entry => 
	        entry.name
	);*/

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