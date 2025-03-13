//B"H
/**
 * write methods for DosDB class
 */
var fs = require("fs").promises;
var path = require("path");


const awtsmoosBinary = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js");
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
        filters: {
            propertyToSearchIn: "content",
            searchTerms: ["hello", "there"]
        },
        mapToOne: true,
        maxOrech: null,
        max: false,
        meta: false,
        keepJSON: false,
        extra: false
    }) {
        const keepJSON = options.keepJSON;
        try {
            if(!options || typeof options !== "object") {
                options = {};
            }
            const filePath = await this.getAwtsmoosFilePath(id);
            const statObj = await fs.stat(filePath);
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
                        console.log("NO not found)")
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
            } else if(ext === ".awtsmoosJSON") {
                const data = await this.getDynamicBinaryRecord({
                    ob: {
                        filePath,
                        properties: options.propertyMap,
                        derech: options.derech,
                        stat: statObj,
                        maxOrech: options.maxOrech,
                        filterBy: options.filterBy,
                        meta: options.meta
                    },
                    isFile: true
                });
                if(data.success) return data;
                if(data.error) return null;
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
        properties
    }) {
        try {
            if(!properties) {
                const data = await fs.readFile(path);
                if(await awtsmoosBinary.isAwtsmoosObject(data)) {
                    return {
                        success: await awtsmoosBinary.deserializeBinary(data)
                    }
                }
                return null;
            } else {
                let props = properties;
                if(typeof props === "string") {
                    try {
                        props = JSON.parse(props);
                    } catch (e) {}
                }
                if(await awtsmoosBinary.isAwtsmoosObject(path)) {
                    return {
                        success: await awtsmoosBinary.mapBinary(path, props)
                    }
                }
                return null;
            }
        } catch (e) {
            console.log("Issue reading", e);
            return {
                error: e
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
        try {
            let joined = null;
            if(!isFile) {
                joined = path.join(ob.filePath, "_awts.awtsmoosJSON");
                await fs.access(joined);
            } else {
                joined = await this.ensureAwtsmoosBinaryPath(ob.filePath, false);
                await fs.access(joined);
            }
            const p = await this.parseBinaryData({
                path: joined,
                properties: ob.properties
            });

            console.log(2,p,joined,777)
            if(p.success) {
                return p;
            }
            if(p.error) throw new Error(p.error);
        } catch (e) {
            if(e.code != "ENOENT") {
                console.log("BINARY error", ob.filePath, ob.properties, e,e.code);
            }
            return {
                error: e.stack,
                somethingWentNotOpenlyGoodYet: true
            };
        }
        return null;
    }
}