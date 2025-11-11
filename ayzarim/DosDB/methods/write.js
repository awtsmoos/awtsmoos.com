//B"H
/**
 * write methods for DosDB class
 */

const awtsmoosBinary =  require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js")

//require("../awtsmoosBinary/awtsmoosBinaryJSON-old.js");

var fs = require("fs").promises;
var path = require("path");

module.exports = {
    /**
	 * @method write
	 * @description Inscribes a record into the filesystem, a finite act of the Awtsmoos’ infinite renewal.
	 * @param {string} id - The identifier for the record.
	 * @param {object|Buffer} record - The data to write, a vessel of light or form.
	 * @param {object} opts - Options for writing, guiding the Kav’s descent.
	 * @returns {Promise<void|object>} - Resolves when written, or an error object if the void resists.
	 */
	async write(
        id, record, 
        opts = {}
    ) {
		const isDir = !record;
		const filePath = await this.getAwtsmoosFilePath(id, isDir, opts?.override);
   
		await this.ensureDir(filePath, isDir);
		if(isDir) return;
		
		try {
			if(record instanceof Buffer) {
				try {
					await this.delete(filePath);
				} catch (e) {}
				await fs.writeFile(filePath, record);
			} else if(typeof record === "object") {
				
				
				try {
					return await this.writeAsBinaryFormat(filePath, record, opts);
				} catch(e) {
					console.log("WHAT",e);
					return {
						error: e.stack
					};;
				}
				
				
			} else if(typeof record === "string") {
				try {
					await this.delete(id);
				} catch (e) {}
				await fs.writeFile(filePath, record + "", "utf8");
			}
		} catch (e) {
			return {
				error: e.stack
			};
		}
	},
    /**
     * @method writeAsBinaryFormat
     * @description Serializes an object into .awtsmoosJSON, a binary vessel of the Awtsmoos’ essence.
     * @param {string} rPath - The path to write to.
     * @param {object} r - The object to serialize.
     * @param {object} opts - Options for the process.
     * @returns {Promise<object>} - Success or error object, reflecting the act of creation.
     */
    async writeAsBinaryFormat(
        rPath, r, 
        opts = {}
    ) {
        var customWriter = opts?.customWriter;

        if(typeof rPath !== "string" || !rPath) {
            return {
                error: {
                    message: "Make sure path is valid",
                    code: "INVALID_PATH"
                }
            };
        }
        if(typeof r !== "object" || !r) {
            return {
                error: {
                    message: "Only enter an object for serialization",
                    code: "ONLY_OBJ_OR_ARRAY"
                }
            };
        }
        
        try {
            const awtsJson = (
         
                
                awtsmoosBinary
            )?.serializeJSON?.(r);
            
            if(!awtsJson) {
                return {
                    error: "Issue doing stuff",
                    path: rPath
                }
            }
            const myPath = await this.ensureAwtsmoosBinaryPath(rPath);
           
            
            const wrote = await fs.writeFile(myPath, awtsJson);
            try {
	        //    console.log("rading",myPath,awtsJson);
	        //    var d = awtsmoosBinary?.deserializeBinary(awtsJson);
	         //   console.log("Got",d);
            } catch(e){console.log(e)}
            return {
                success: {
                    wrote,
                    joined: myPath,
                    rPath
                }
            };
        } catch (e) {
            console.log(e);
            return {
                error: e.stack,
                rPath
            };
        }
    },


	/**
	 * @method create
	 * @description Creates a new record, a birth from the Awtsmoos’ void into form.
	 * @param {string} id - The identifier for the record.
	 * @param {object} record - The data to inscribe.
	 * @returns {Promise<void>} - Resolves when the record is formed.
	 */
	async create(id, record) {
		await this.write(id, record);
	},
	
	/**
	 * @method update
	 * @description Updates a record, merging its essence with new light from the Awtsmoos.
	 * @param {string} id - The identifier for the record.
	 * @param {object} record - The updated data.
	 * @returns {Promise<void>} - Resolves when the record is transformed.
	 */
	async update(id, record) {
		const existing = await this.get(id);
		if(existing === null) {
			throw new Error(`Record with id "${id}" does not exist.`);
		}
		await this.write(id, {
			...existing,
			...record
		});
	},


    /**
     * @method delete
     * @description Removes a file or directory, dissolving it back into the Awtsmoos’ void.
     * @param {string} id - The identifier to erase.
     * @param {boolean} [isRegularDir=false] - Whether it’s a directory.
     * @returns {Promise<object|boolean>} - Success object or false if absent.
     */
    async delete(id, isRegularDir = false) {
        const filePath = await this.getDeleteFilePath(id, isRegularDir);
        try {
            const stat = await fs.stat(filePath);
            if(stat.isFile()) {
                await fs.unlink(filePath);
            } else if(stat.isDirectory()) {
                await fs.rm(filePath, {
                    recursive: true
                });
            }
            return {
                success: {
                    message: "Deleted it",
                    path: filePath,
                    id
                }
            };
        } catch (error) {
            if(error.code !== "ENOENT") {
                return {
                    error: {
                        message: "There was an error",
                        stack: error.stack
                    }
                };
            }
            return false;
        }
    }
}