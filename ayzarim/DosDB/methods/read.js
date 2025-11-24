//B"H
/**
 * write methods for DosDB class
 */
var fs = require("fs").promises;
var path = require("path");


const awtsmoosBinary = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js")


module.exports = {
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
                
                const fileIndexes = await this.getDirectoryIndecies({
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
                    const info = (fileIndexes || []).map(fileName =>
                        !keepJSON ? this.removeJSONExtension(fileName) : fileName
                    );
                    return options.extra ? {
                        directory: info
                    } : info;
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
                var suc = data;
                if(!data) return data;
                if(data?.error) return null;
                if(data?.success) {
                    suc = data.success;

                    if(suc?.success) {
                        return !options?.extra ? 
                         suc.success : {
                            dynamicEntry: suc.success
                         }
                    }
                    else return !options?.extra ? suc : {
                        dynamicEntry: suc
                    };
                }  else return !options?.extra ? 
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