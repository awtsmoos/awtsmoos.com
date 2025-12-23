//B"H
/**
 * write methods for DosDB class
 */
var fs = require("fs").promises;
var path = require("path");


const awtsmoosBinary = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js")


module.exports = {
    /**
     * @method traverse
     * @description Recursively walks the database, revealing the full structure of the Awtsmoos' creation in a single vessel.
     *              "Maaseh Bereishis" - detailing the structure of the beginning.
     * @param {string} id - The starting path (default root).
     * @param {object} options - Options to guide the traversal.
     * @param {function} options.onProgress - Callback (info) => void. Info: { count, path, type, depth }.
     * @param {boolean} options.loadContent - If true, reads the essence (content) of files.
     * @param {number} options.maxDepth - Limit the descent into the void (default Infinity).
     * @param {boolean} options.fullDetails - If true, includes native fs.Stats.
     * @returns {Promise<object>} - The hierarchical structure of the traversed paths.
     */
    async traverse(id = "/", options = {}) {
        const {
            onProgress,
            loadContent = false,
            maxDepth = Infinity,
            fullDetails = false
        } = options;

        // Resolve the root path in the physical realm
        const rootPath = await this.getAwtsmoosFilePath(id);
        
        let stats;
        try {
            stats = await fs.stat(rootPath);
        } catch(e) {
            return { 
                error: { 
                    message: "Path not found in the void", 
                    path: id, 
                    details: e.message 
                } 
            };
        }

        const result = {
            path: id,
            name: path.basename(id) || "root",
            type: stats.isDirectory() ? "directory" : "file"
        };
        
        if (fullDetails) result.stats = stats;

        // If it's a single file, return it immediately
        if (!stats.isDirectory()) {
            if (loadContent) {
                result.content = await this.get(id);
            }
            return result;
        }

        result.children = [];
        let count = 0;

        // Recursive function to walk the tree (The Kav extending downwards)
        const processDir = async (node, absPath, relPath, depth) => {
            if (depth >= maxDepth) return;

            let entries;
            try {
                entries = await fs.readdir(absPath, { withFileTypes: true });
            } catch(e) {
                node.error = "Could not read directory: " + e.message;
                return;
            }

            for (const entry of entries) {
                const isDir = entry.isDirectory();
                const rawName = entry.name;
                
                // We use the DB's logic to strip .awtsmoosJSON or .json for the ID/Name
                const cleanName = this.removeJSONExtension(rawName);
                
                // Construct relative path for DB addressability
                // Handle root slash carefully to avoid double slashes
                const entryRelPath = relPath === "/" ? cleanName : path.join(relPath, cleanName);
                const entryAbsPath = path.join(absPath, rawName);

                count++;
                if (onProgress) {
                    onProgress({ 
                        count, 
                        path: entryRelPath, 
                        type: isDir ? 'directory' : 'file',
                        depth: depth + 1
                    });
                }

                const child = {
                    name: cleanName,
                    path: entryRelPath,
                    type: isDir ? "directory" : "file"
                };

                if (fullDetails) {
                    try { 
                        child.stats = await fs.stat(entryAbsPath); 
                    } catch(e) {}
                }

                if (isDir) {
                    child.children = [];
                    await processDir(child, entryAbsPath, entryRelPath, depth + 1);
                } else {
                    if (loadContent) {
                        // Use this.get to handle automatic parsing of .json/.awtsmoosJSON
                        // Or raw reading if it's a regular file
                        child.content = await this.get(entryRelPath);
                    }
                }
                
                node.children.push(child);
            }
        };

        await processDir(result, rootPath, id, 0);
        return result;
    },

    /**
	 * @method readFileWithOffset
	 * @description Reads a segment of a file, a finite glimpse into the Awtsmoos’ boundless scroll.
	 * @param {string} filePath - The path to read from.
	 * @param {number} offset - The starting point, a spark within the Ohr Ein Sof.
	 * @param {number} length - The length to read, a measured vessel of light.
	 * @returns {Promise<Buffer|string>} - The data read, or an error message if the void prevails.
	 */
	async readFileWithOffset(filePath, offset, length) {
		try {
			const fileHandle = await fs.open(filePath, "r");
			const buf = Buffer.alloc(length);
			const {
				bytesRead,
				buffer
			} = await fileHandle.read(buf, 0, length, offset);
			await fileHandle.close();
			return buffer.subarray(0, Math.min(bytesRead, length));
		} catch (err) {
			console.error("Error reading file:", err);
			return "didn't read it: " + err;
		}
	},
    /**
     * @method read
     * @description Alias for get, a mirror of the Awtsmoos’ revelation through retrieval.
     * @param {...any} args - Arguments passed to get.
     * @returns {Promise<any>} - The retrieved data, a reflection of the infinite.
     */
    async read(...args) {
        return await this.get(...args);
    },
    
    /**
     * @method get
     * @description Retrieves a record or directory contents, unveiling the Awtsmoos within the finite.
     * @param {string} id - The identifier to seek.
     * @param {object} options - Configuration for retrieval, shaping the light of Ohr Ein Sof.
     * @returns {Promise<object|Array<string>|null>} - The record, directory contents, or null if absent.
     */
    async get(id, options = {
        access: false,
        recursive: false,
        pageSize: 10,
        page: 1,
        filesAndFoldersDifferent: false,
        derech: null,
        filterBy: null,
        order: "asc",
        sortBy: "createdBy",
        showJson: true,
        propertyMap: null,
		arrayFilter:null,
        filters: {
            propertyToSearchIn: "content",
            searchTerms: ["hello", "there"]
        },
        mapToOne: true,
        maxOrech: null,
        max: false,
        meta: false,
        lastModified:false,
        keepJSON: false,
        extra: false
    }) {
    //console.log("WHAT",id)
        const keepJSON = options.keepJSON;
        var extra = options.extra;
        try {
            if(!options || typeof options !== "object") {
                options = {};
            }
            const filePath = await this.getAwtsmoosFilePath(id);
            const statObj = await fs.stat(filePath);
            
            //console.log("awtsPath",filePath);
            if(options.access) return statObj;
            if(options.meta) return statObj.birthtime;
            
            if(statObj.isDirectory()) {
                let checkIfItsSingleEntry = null;
                if(!this.readAwtsmoosBinary) {
                    checkIfItsSingleEntry = await this.getDynamicRecord({
                        filePath,
                        properties: options.propertyMap,
                        derech: options.derech,
                        stat: statObj,
                        maxOrech: options.maxOrech,
                        filterBy: options.filterBy,
                        meta: options.meta
                    });
                } else {
                    checkIfItsSingleEntry = await this.getDynamicBinaryRecord({
                        ob: {
                            filePath,
                            properties: options.propertyMap,
                            derech: options.derech,
                            stat: statObj,
                            maxOrech: options.maxOrech,
                            filterBy: options.filterBy,
                            meta: options.meta
                        },
                        isFile: false
                    });
                    
                    
                }
                if(checkIfItsSingleEntry || checkIfItsSingleEntry === undefined) {


                    if(checkIfItsSingleEntry?.error) {
                    
                        checkIfItsSingleEntry = null;
                    }

                    if(checkIfItsSingleEntry) {

                        if(checkIfItsSingleEntry?.success) 
                            checkIfItsSingleEntry = checkIfItsSingleEntry.success;


                        if(checkIfItsSingleEntry?._awtsmoosDeletify)
                            return undefined;
                        
                        return options.extra ? {
                            dynamicEntry: checkIfItsSingleEntry
                        } : checkIfItsSingleEntry;
                    }
                }
                
                var fileIndexes = await this.getDirectoryIndecies({
                    directoryPath: filePath,
                    page: options.page || 1,
                    pageSize: options.max === true ? 500 : options.pageSize || 10,
                    maxOrech: options.maxOrech,
                    filterBy: options.filterBy,
                    sortBy: options.sortBy || "createdBy",
                    order: options.order || "asc",
                    filters: options.filters || {},
                    keepJSON,
                    id,
                    db: this,
                    fs
                });
                
                if(options.recursive) {
                    let allContents = {};
                    for(const fileName in fileIndexes.files) {
                        const res = await this.get(path.join(id, fileName), options);
                        if(res !== null) {
                            allContents[!keepJSON ? this.removeJSONExtension(fileName) : fileName] = res;
                        }
                    }
                    for(const dirName in fileIndexes.subdirectories) {
                        const res = await this.get(path.join(id, dirName), options);
                        if(res !== null) {
                            allContents[!keepJSON ? this.removeJSONExtension(dirName) : dirName] = res;
                        }
                    }
                    return options.extra ? {
                        directory: allContents
                    } : allContents;
                } else {
                    (fileIndexes || []).forEach(entry=> {
                        if(!keepJSON) {
	                        entry.name = this.removeJSONExtension(entry.name)
                        }
                    });
                    if(!extra) {
	                    fileIndexes = fileIndexes.map(q => q.name);
                    }
                    return fileIndexes;
                }
            }
            
            const ext = path.extname(filePath);
            if(ext === ".json") {
                const data = await fs.readFile(filePath, "utf-8");
                const res = JSON.parse(data);
                if(options.full) {
                    return {
                        entityId: id,
                        data: res,
                        created: statObj.atime,
                        modified: statObj.birthtime
                    };
                }
                return options.extra ? {
                    json: res
                } : res;
            } else if(ext === ".awtsmoosJSON" || !ext) {
                const data = await this.getDynamicBinaryRecord({
                    ob: {
                        filePath,
                        properties: options.propertyMap,
						arrayFilter: options.arrayFilter,
                        derech: options.derech,
                        stat: statObj,
                        maxOrech: options.maxOrech,
                        filterBy: options.filterBy,
                        meta: options.meta
                    },
                    isFile: true
                });
                
                // --- Awtsmoos Logic Update ---
                // If it is NOT a valid Awtsmoos binary object (success), AND it has no extension,
                // we must assume it is a regular file (text, script, etc.) and read its essence directly.
                let isValidBinary = false;
                if(data && data.success) {
                     isValidBinary = true;
                     var suc = data.success;
                     if(suc?.success) {
                        return !options?.extra ? 
                         suc.success : {
                            dynamicEntry: suc.success
                         }
                    }
                    else return !options?.extra ? suc : {
                        dynamicEntry: suc
                    };
                }

                if (!isValidBinary && !ext) {
                     try {
                        const content = await fs.readFile(filePath);
                        return options.extra ? { file: content } : content;
                     } catch(e) {
                         // If read failed, return the original error from binary attempt or null
                     }
                }
                
                return !options?.extra ? 
                    data : {
                        dynamicEntry: data
                    };

            } else {
                const content = await fs.readFile(filePath);
                return options.extra ? {
                    file: content
                } : content;
            }
        } catch (err) {
            if(err.code !== "ENOENT") console.error(err);
            return null;
        }
    },
    /**
     * @method parseBinaryData
     * @description Deserializes binary data, unveiling the Awtsmoos’ hidden light within.
     * @param {object} param - Parameters including path and properties.
     * @returns {Promise<object|null>} - The deserialized data, or null if the form collapses.
     */
    async parseBinaryData({
        path,
        properties,
		arrayFilter,
		parseBinaryData
    }) {
	
		
        try {
            const data = await fs.readFile(path);
            if(
                !properties && !arrayFilter
                
            ) {
                
                if(  awtsmoosBinary.isAwtsmoosObject(data)) {
                
                    
                    var s =  awtsmoosBinary.deserializeBinary(data)
    
                    
                    return {
                        success: s
                    }
                }
                return null;
            } 
			
			if(properties || arrayFilter) {
				
                let props = properties;
				if(!props) props = {};
				
                if(typeof props === "string") {
                    try {
                        props = JSON.parse(props);
                    } catch (e) {
						console.log(e);
						props = {};
					}
                }

				
                if(await awtsmoosBinary.isAwtsmoosObject(path)) {
					
                    var mpt =  awtsmoosBinary.mapObject(
						path,
						props,
						null,
						arrayFilter
					);
					
                    return {
                        success: mpt
                    }
                } else {
					
					
				}
                return null;
			}
        } catch (e) {
            
            return {
                path,
                error: e.stack
            };
        }
    },
    
    /**
     * @method getDynamicBinaryRecord
     * @description Retrieves a binary record, a spark of the Awtsmoos’ infinite renewal.
     * @param {object} param - Parameters including filePath and properties.
     * @returns {Promise<object|null>} - The record, or null if the void prevails.
     */
    async getDynamicBinaryRecord({
        ob,
        isFile = false
    }) {

        let joined = null;
        try {
            joined = await this.ensureAwtsmoosBinaryPath(ob.filePath, false);
            await fs.access(joined);
            try {
                const p = await this.parseBinaryData({
                    path: joined,
                    properties: ob.properties,
					arrayFilter: ob.arrayFilter
                });
				
                
                if(p.success) {
                    return p;
                }
                if(p.error) {
                  //  console.log("parse issue",p);
                    return {
                        error: {
                            message: "Coudn't parse binary data",
                            path: joined,
                            details: p.error
                        }
                    }
                }
            } catch(e) {
                console.log("issue eading",e)
            }
        } catch (e) {
            if(e.code != "ENOENT") {
                console.log("BINARY error", ob.filePath, ob.properties, e,e.code,
                    ob,
                    ob.filePath
                );
            }
            return {
                error: e.stack,
                somethingWentNotOpenlyGoodYet: true
            };
        }
        return null;
    }
}